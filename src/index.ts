import { Client, Intents } from "discord.js";
import log from "electron-log";
import { Scraper } from "./Scraper";
import { loadEnv } from "./utils/loadEnv";
import { numberWithCommas } from "./utils/numberWithCommas";
import { sleep } from "./utils/sleep";

// load the environment variables
loadEnv();

async function main() {
    // Create a new client instance
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

    client.once("ready", async () => {
        log.info("Bot logged in");

        const actions: Array<() => void> = [];

        client.user?.setPresence({
            activities: [
                {
                    name: "SOL/USD",
                    type: "WATCHING",
                },
            ],
        });

        const scraper = new Scraper();

        const updateName = () => {
            client.guilds.cache.forEach(async (guild) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const user = await guild.members.fetch(client.user!.id);
                if (actions.length > 0) {
                    actions.length = 0;
                }
                actions.push(async () => {
                    try {
                        user.setNickname(
                            `$${numberWithCommas(scraper.getPrice() || 0)}`
                        );
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } catch (err: any) {
                        log.error(err.toString());
                    }
                });
            });
        };

        scraper.on("newPrice", (p) => {
            log.info("New price " + p);
            updateName();
        });

        const processActions = async () => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (actions.length > 0) {
                    const action = actions.pop() as () => void;
                    action();
                    log.info("Processed action");
                }
                await sleep(1000);
            }
        };
        processActions();
    });

    client.login(process.env.DISCORD_TOKEN);
}

main();
