const util = require('util');
const exec = util.promisify(require('child_process').exec);
chains = [
  [
    [
      `g++ -o opendbc/can/common.os -c -std=c++1z -DDBC_FILE_PATH='"/root/opendbc/opendbc/dbc"' -g -fPIC -O0 -Wunused -Werror -Wshadow -Wno-vla-cxx-extension -Wno-unknown-warning-option -fPIC -I. -I/usr/lib/include -I/opt/homebrew/include -I/usr/include/python3.12 opendbc/can/common.cc`,
      `g++ -o opendbc/can/dbc.os -c -std=c++1z -DDBC_FILE_PATH='"/root/opendbc/opendbc/dbc"' -g -fPIC -O0 -Wunused -Werror -Wshadow -Wno-vla-cxx-extension -Wno-unknown-warning-option -fPIC -I. -I/usr/lib/include -I/opt/homebrew/include -I/usr/include/python3.12 opendbc/can/dbc.cc`,
      `g++ -o opendbc/can/parser.os -c -std=c++1z -DDBC_FILE_PATH='"/root/opendbc/opendbc/dbc"' -g -fPIC -O0 -Wunused -Werror -Wshadow -Wno-vla-cxx-extension -Wno-unknown-warning-option -fPIC -I. -I/usr/lib/include -I/opt/homebrew/include -I/usr/include/python3.12 opendbc/can/parser.cc`,
      `g++ -o opendbc/can/packer.os -c -std=c++1z -DDBC_FILE_PATH='"/root/opendbc/opendbc/dbc"' -g -fPIC -O0 -Wunused -Werror -Wshadow -Wno-vla-cxx-extension -Wno-unknown-warning-option -fPIC -I. -I/usr/lib/include -I/opt/homebrew/include -I/usr/include/python3.12 opendbc/can/packer.cc`,
    ],
    [
      `g++ -o opendbc/can/libdbc.so -shared opendbc/can/dbc.os opendbc/can/parser.os opendbc/can/packer.os opendbc/can/common.os -Lopendbc/can -L/opt/homebrew/lib`,
    ],
  ],
  [
    [`cythonize opendbc/can/packer_pyx.pyx`],
    [`g++ -o opendbc/can/packer_pyx.o -c -std=c++1z -g -fPIC -O0 -Wunused -Wshadow -Wno-vla-cxx-extension -Wno-unknown-warning-option -Wno-#warnings -Wno-shadow -Wno-deprecated-declarations -I. -I/usr/lib/include -I/opt/homebrew/include -I/usr/include/python3.12 -I.venv/lib/python3.12/site-packages/numpy/_core/include opendbc/can/packer_pyx.cpp`],
    [`g++ -o opendbc/can/packer_pyx.so -pthread -shared -Wl,-rpath=/root/opendbc/opendbc/can opendbc/can/packer_pyx.o -Lopendbc/can -L/opt/homebrew/lib -Lopendbc/can -ldbc`], // race condition: this must be run after "g++ -o opendbc/can/dbc.os" completes
  ],
  [
    [`cythonize opendbc/can/parser_pyx.pyx`],
    [`g++ -o opendbc/can/parser_pyx.o -c -std=c++1z -g -fPIC -O0 -Wunused -Wshadow -Wno-vla-cxx-extension -Wno-unknown-warning-option -Wno-#warnings -Wno-shadow -Wno-deprecated-declarations -I. -I/usr/lib/include -I/opt/homebrew/include -I/usr/include/python3.12 -I.venv/lib/python3.12/site-packages/numpy/_core/include opendbc/can/parser_pyx.cpp`],
    [`g++ -o opendbc/can/parser_pyx.so -pthread -shared -Wl,-rpath=/root/opendbc/opendbc/can opendbc/can/parser_pyx.o -Lopendbc/can -L/opt/homebrew/lib -Lopendbc/can -ldbc -lre2`], // race condition: this must be run after "g++ -o opendbc/can/dbc.os" completes
  ],
  [
    [`cythonize opendbc/can/can_define_pyx.pyx`],
    [`g++ -o opendbc/can/can_define_pyx.o -c -std=c++1z -g -fPIC -O0 -Wunused -Wshadow -Wno-vla-cxx-extension -Wno-unknown-warning-option -Wno-#warnings -Wno-shadow -Wno-deprecated-declarations -I. -I/usr/lib/include -I/opt/homebrew/include -I/usr/include/python3.12 -I.venv/lib/python3.12/site-packages/numpy/_core/include opendbc/can/can_define_pyx.cpp`],
    [`g++ -o opendbc/can/can_define_pyx.so -pthread -shared -Wl,-rpath=/root/opendbc/opendbc/can opendbc/can/can_define_pyx.o -Lopendbc/can -L/opt/homebrew/lib -Lopendbc/can -ldbc`], // race condition: this must be run after "g++ -o opendbc/can/dbc.os" completes
  ],
  [
    [`python3 opendbc/dbc/generator/generator.py`],
  ],
]
const run_series = async(chain) => {
  for(cmds of chain) {
    await Promise.all(cmds.map(cmd => exec(cmd)))
  }
}
for(const chain of chains) {
  run_series(chain)
}
