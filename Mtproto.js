import MTProto from "@mtproto/core"
import path from "path"

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const api_id = "18465749"
const api_hash = "9b55af0558c7d87b9c3478fd1a67ee73"


    const mtproto = new MTProto({
        api_id,
        api_hash,

        storageOptions: {
            path: path.resolve(__dirname, './data/1.json'),
        },
    });
 
    // mtproto.call('help.getNearestDc').then(result => {
    //     console.log('country:', result.country);
    // })
    console.log(mtproto)

    mtproto.call('messages.sendMessage', {
        clear_draft: true,
      
        peer: {
          _: 'inputPeerSelf',
        },
        message: 'Hello @mtproto_core',
        entities: [
          {
            _: 'messageEntityBold',
            offset: 6,
            length: 13,
          },
        ],
      
        random_id: Math.ceil(Math.random() * 0xffffff) + Math.ceil(Math.random() * 0xffffff),
    }).then(result => console.log(result)).catch(e => {
          console.log(e)
      });
      