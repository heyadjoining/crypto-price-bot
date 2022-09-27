import axios from "axios";
import { EventEmitter } from "stream";

export class Scraper extends EventEmitter {
    private gasPrice: number | null = null;
    private price: number | null = null;

    constructor() {
        super();
        this.init();
    }

    public getPrice() {
        return this.price;
    }

    public getGasPrice() {
        return this.gasPrice;
    }

    private init = async () => {
        this.fetchPrice();
        setInterval(() => {
            this.fetchPrice();
        }, 10000);
    };

    private fetchPrice = async () => {
        const res = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
        );
        if (this.price !== res.data.solana.usd) {
            this.price = res.data.solana.usd;
            this.emit("newPrice", this.price);
        }
    };
}
