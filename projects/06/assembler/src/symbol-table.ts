export const FREE_ADDRESS_HEAD = 16;

export class SymbolTable {
  private addressMap: { [key: string]: number } = {};

  constructor() {
    this.initAddressMap();
  }

  addEntry(symbol: string, address: number): void {
    this.addressMap[symbol] = address;
  }

  contains(symbol: string): boolean {
    return symbol in this.addressMap;
  }

  getAddress(symbol: string): number {
    if (!this.contains(symbol)) {
      return -1;
    }
    return this.addressMap[symbol];
  }

  dump(): string {
    return JSON.stringify(this.addressMap, null, 2);
  }

  private initAddressMap(): void {
    this.addressMap = {
      SP: 0,
      LCL: 1,
      ARG: 2,
      THIS: 3,
      THAT: 4,
      SCREEN: 16384,
      EBD: 24576,
    };

    for (let i = 0; i < FREE_ADDRESS_HEAD; i++) {
      this.addressMap[`R${i}`] = i;
    }
  }
}
