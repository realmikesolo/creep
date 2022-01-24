import Steam from 'steamapi';
export class SteamAPI {
  public steam = new Steam(process.env.STEAM_API_KEY);
  public toSteam32Id(steam64Id: string): string {
    return (BigInt(steam64Id) - 76561197960265728n).toString();
  }

  public resolve(user: string) {
    return this.steam.resolve(user);
  }
}
