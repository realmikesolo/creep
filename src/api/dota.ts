import axios from 'axios';
export class DotaAPI {
  public async getWinlose(steam32Id: string) {
    return axios.get(`https://api.opendota.com/api/players/${steam32Id}/wl`).then((res) => res.data);
  }

  public async getAccountInfo(steam32Id: string) {
    return axios.get(`https://api.opendota.com/api/players/${steam32Id}`).then((res) => res.data);
  }

  public async getPlayerHeroes(steam32Id: string) {
    return axios.get(`https://api.opendota.com/api/players/${steam32Id}/heroes`).then((res) => res.data);
  }

  public async getHeroes() {
    return axios.get('https://api.opendota.com/api/heroes').then((res) => res.data);
  }

  public async getMatch(steam32Id: string) {
    return axios.get(`https://api.opendota.com/api/players/${steam32Id}/matches`).then((res) => res.data);
  }

  public async getDate(matchId: string) {
    return axios.get(`https://api.opendota.com/api/matches/${matchId}`).then((res) => res.data);
  }
}
