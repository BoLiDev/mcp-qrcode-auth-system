import keychain from 'keychain';

export class KeychainManager {
  private accountName: string;
  private service: string;

  constructor(accountName: string, service: string) {
    this.accountName = accountName;
    this.service = service;
  }

  async getPassword(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      keychain.getPassword(
        {
          account: this.accountName,
          service: this.service,
        },
        (error, token) => {
          if (error) {
            reject(error);
          } else {
            resolve(token);
          }
        }
      );
    });
  }

  async savePassword(password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      keychain.setPassword(
        {
          account: this.accountName,
          service: this.service,
          password,
        },
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async clearPassword(): Promise<void> {
    return new Promise((resolve, reject) => {
      keychain.deletePassword(
        {
          account: this.accountName,
          service: this.service,
        },
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
