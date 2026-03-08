import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/orders",
})
export class OrdersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinRestaurant")
  handleJoinRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string
  ) {
    client.join(`restaurant:${restaurantId}`);
    this.logger.log(
      `Client ${client.id} joined restaurant room: ${restaurantId}`
    );
    return { event: "joined", data: { restaurantId } };
  }

  @SubscribeMessage("leaveRestaurant")
  handleLeaveRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() restaurantId: string
  ) {
    client.leave(`restaurant:${restaurantId}`);
    this.logger.log(
      `Client ${client.id} left restaurant room: ${restaurantId}`
    );
  }

  /**
   * Emit a new order event to the restaurant room.
   * Called from OrdersService after order creation.
   */
  emitNewOrder(restaurantId: string, order: any) {
    this.server
      .to(`restaurant:${restaurantId}`)
      .emit("newOrder", order);
    this.logger.log(`New order emitted to restaurant ${restaurantId}`);
  }

  /**
   * Emit an order status update to the restaurant room.
   */
  emitOrderUpdate(restaurantId: string, order: any) {
    this.server
      .to(`restaurant:${restaurantId}`)
      .emit("orderUpdated", order);
  }

  /**
   * Emit an incoming call event to the restaurant room.
   */
  emitIncomingCall(restaurantId: string, call: any) {
    this.server
      .to(`restaurant:${restaurantId}`)
      .emit("incomingCall", call);
  }
}
