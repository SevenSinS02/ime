import * as helper from './helper';
import config from '../../config';

class Service {
  create(obj) {
    const data = obj.answerTwo.reduce((obj, dat) => {
      if (dat.title === 'MUSIC COMPOSER') {
        obj.composer = dat.value;
        return obj;
      } else if (dat.title === 'LYRICIST') {
        obj.lyricist = dat.value;
        return obj;
      } else if (dat.title === 'SINGER') {
        obj.singer = dat.value;
        return obj;
      } else if (dat.title === 'INSTRUMENT PLAYERS') {
        obj.instrument = dat.value;
        return obj;
      } else if (dat.title === 'PRODUCER (THE ONE WHO PAYS)') {
        obj.producer = dat.value;
        return obj;
      } else if (dat.title === 'DISTRIBUTION CHANNEL') {
        obj.distribution = dat.value;
        return obj;
      } else if (dat.title === 'ME, THE LISTENER!') {
        obj.me = dat.value;
        return obj;
      }
    }, {});
    if (!obj.name) obj.name = null;
    if (!obj.email) obj.email = null;
    if (!obj.comment) obj.comment = null;

    this.url = `${config.baseUri}/api/v1/user`;
    return helper.post(this.url, { ...obj, ...data });
  }

  getAll() {
    this.url = `${config.baseUri}/api/v1/user`;
    return helper.get(this.url);
  }

  update({ id, name, email }) {
    this.url = `${config.baseUri}/api/v1/user`;
    return helper.put(this.url, { id, name, email });
  }

  getChart() {
    this.url = `${config.baseUri}/api/v1/chart`;
    return helper.get(this.url);
  }
}
export const client = new Service();
