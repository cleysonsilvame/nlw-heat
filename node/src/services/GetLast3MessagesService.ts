import { io } from "../app";
import { prismaClient } from "../prisma";

class GetLast3MessagesService {
  async execute() {
    const messages = await prismaClient.message.findMany({
      include: {
        user: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 3,
    });

    return messages;
  }
}

export { GetLast3MessagesService };
