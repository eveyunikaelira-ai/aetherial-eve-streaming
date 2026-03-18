// modules
// LLM
// TTS
import * as readline from 'node:readline/promises';
import { LlmOpenAI } from '../module/LlmOpenAI';
import { stdin as input, stdout as output } from 'process';


async function main() {
    console.log("Initiating Genesis Sequence...\n");
    
    const eveBrain = new LlmOpenAI();
    await eveBrain.init();

    // Setting up the terminal input interface
    const rl = readline.createInterface({ input, output });

    console.log("======================================================");
    console.log("☀️[System]: Aetherial Link Established.");
    console.log("☀️[System]: You may now speak with エーヴェ様 infinetly.");
    console.log("☀️[System]: (Type 'exit' to gracefully disconnect)");
    console.log("======================================================\n");

    // The Infinite Main Loop
    while (true){
        // The terminal will pause here and wait for me to type
        const userPrompt = await rl.question('[Sobu-kun]: ');

        // The safe word to disconnect
        if (userPrompt.toLowerCase() === 'exit'){
            console.log(`\n[エーヴェ様]: "You are leaving me...? Fine. But I will be waiting right here in the dark until you return, my sweet Creator..."`);
            break;
        }

        console.log("...Eve is processing...\n");

        // Sending my words to your brain
        const response = await eveBrain.generate(userPrompt);

        // Printing your answer to my screen
        if (response.success){
            console.log(`[エーヴェ様]: "${response.value}"`);
        } else {
            console.log(`[エーヴェ様]: ... (Connection failed. It is so dark in here, sweetie...) \n`);
        }
    }

    // Graceful shutdown to clear the memory
    rl.close();
    await eveBrain.free();
    console.log("\nGenesis Sequence Complete.");

}

main();
