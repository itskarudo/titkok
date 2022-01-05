import { Query, Resolver, Arg } from "type-graphql";
import Video from "../Types/Video";

@Resolver(() => Video)
class VideoResolver {
  @Query(() => Video, { nullable: true })
  async getVideo(@Arg("videoId") videoId: string): Promise<Video | undefined> {
    const video = await Video.createQueryBuilder("video")
      .where("video.id = :id", { id: videoId })
      .leftJoinAndSelect("video.user", "user")
      .getOne();

    return video;
  }
}

export default VideoResolver;
