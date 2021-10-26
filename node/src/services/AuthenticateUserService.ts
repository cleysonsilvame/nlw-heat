import axios from "axios";
import { sign } from "jsonwebtoken";
import { prismaClient } from "../prisma";

interface IAuthenticateUserService {
  access_token: string;
}

interface IUserResponse {
  avatar_url: string;
  login: string;
  id: number;
  name: string;
}

class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    const { data: accessTokenResponse } =
      await axios.post<IAuthenticateUserService>(url, null, {
        params: {
          code,
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
        },
        headers: { Accept: "application/json" },
      });

    const response = await axios.get<IUserResponse>(
      "https://api.github.com/user",
      {
        headers: {
          authorization: `Bearer ${accessTokenResponse.access_token}`,
        },
      }
    );

    const { avatar_url, id: github_id, login, name } = response.data;

    let user = await prismaClient.user.findFirst({
      where: { github_id },
    });

    if (!user) {
      user = await prismaClient.user.create({
        data: { github_id, name, login, avatar_url },
      });
    }

    const token = sign(
      {
        user: {
          id: user.id,
          name,
          avatar_url,
        },
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "1d",
      }
    );

    return { token, user };
  }
}

export { AuthenticateUserService };
