"use strict";

const chalk = require("chalk");
const { version } = require('../package.json');

// Auto-clear dihapus — library gak boleh maksa bersihin terminal punya project lain yang makein ini

const W = 54;
const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');
const pad = (str, width) => str + ' '.repeat(Math.max(0, width - stripAnsi(str).length));
const border = chalk.hex('#7c3aed');
const side = border('│');
const row = (content = '') => side + pad(content, W) + side;
const blank = () => row();

console.log('\n' + border('╭' + '─'.repeat(W) + '╮'));
console.log(blank());
console.log(row(chalk.hex('#c084fc').bold('   ██╗  ██╗██╗  ██╗██╗   ██╗███████╗')));
console.log(row(chalk.hex('#a78bfa').bold('   ██║ ██╔╝██║  ██║╚██╗ ██╔╝╚══███╔╝')));
console.log(row(chalk.hex('#8b5cf6').bold('   █████╔╝ ███████║ ╚████╔╝   ███╔╝ ')));
console.log(row(chalk.hex('#7c3aed').bold('   ██╔═██╗ ██╔══██║  ╚██╔╝   ███╔╝  ')));
console.log(row(chalk.hex('#6d28d9').bold('   ██║  ██╗██║  ██║   ██║   ███████╗')));
console.log(row(chalk.hex('#5b21b6').bold('   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝')));
console.log(blank());
console.log(row(chalk.hex('#d7a1ff').italic('   ✦  Modded WhatsApp Web API · by KhyzOffc')));
console.log(border('├' + '─'.repeat(W) + '┤'));
console.log(blank());
console.log(row(chalk.hex('#89CFF0')('   Version     ') + chalk.hex('#e2d9f3').bold(version)));
console.log(row(chalk.hex('#89CFF0')('   Platform    ') + chalk.hex('#e2d9f3').bold('WhatsApp Web (Multi-Device)')));
console.log(row(chalk.hex('#89CFF0')('   Modified by ') + chalk.hex('#c084fc').bold('KhyzOffc')));
console.log(row(chalk.hex('#89CFF0')('   Contact     ') + chalk.hex('#a78bfa').bold('wa.me/KhyzFemes')));
console.log(row(chalk.hex('#89CFF0')('   Node.js     ') + chalk.hex('#e2d9f3').bold(process.version)));
console.log(blank());
console.log(row(chalk.hex('#a78bfa').italic('   ⋆ ˚ ✦ Ready to connect ✦ ˚ ⋆')));
console.log(blank());
console.log(border('╰' + '─'.repeat(W) + '╯') + '\n');

// ============================
// FIXED __createBinding
// ============================

var createBinding =
  (this && this.createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          (!("get" in desc) && (desc.writable || desc.configurable))
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });

var exportStar =
  (this && this.exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p))
        createBinding(exports, m, p);
  };

var importDefault =
  (this && this.importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };

Object.defineProperty(exports, "__esModule", { value: true });

const Socket_1 = importDefault(require("./Socket"));

exports.makeWASocket = Socket_1.default;

exportStar(require("../WAProto"), exports);
exportStar(require("./Utils"), exports);
exportStar(require("./Types"), exports);
exportStar(require("./Store"), exports);
exportStar(require("./Defaults"), exports);
exportStar(require("./WABinary"), exports);
exportStar(require("./WAM"), exports);
exportStar(require("./WAUSync"), exports);

exports.default = Socket_1.default;