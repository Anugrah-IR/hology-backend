import crypto from 'crypto';
import fs from 'fs';

class Secrets {
  public keyDir: string = __dirname + '/../../keys';

  constructor() {
    if (!fs.existsSync(this.keyDir)) {
      fs.mkdirSync(this.keyDir);
    }

    if (!fs.existsSync(this.keyDir + '/public.pem')) {
      this.generateKeys();
    }
  }

  private generateKeys(): void {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    fs.writeFileSync(this.keyDir + '/public.pem', keyPair.publicKey);
    fs.writeFileSync(this.keyDir + '/private.pem', keyPair.privateKey);
  }

  public getPublicKey(): string {
    return fs.readFileSync(this.keyDir + '/public.pem', 'utf8');
  }

  public getPrivateKey(): string {
    return fs.readFileSync(this.keyDir + '/private.pem', 'utf8');
  }
}

export default new Secrets();
