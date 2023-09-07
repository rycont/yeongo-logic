const instructionSet = {
    exit(arg) {
        this.exit(arg)
    },

    setTemp(arg) {
        this.temp = arg
    },

    addTemp(arg) {
        this.temp += arg
    },

    subTemp(arg) {
        this.temp -= arg
    },

    mulTemp(arg) {
        this.temp *= arg
    },

    divTemp(arg) {
        this.temp /= arg
    },

    modTemp(arg) {
        this.temp %= arg
    },

    setCursor(arg) {
        this.cursor = arg
    },

    addCursor(arg) {
        this.cursor += arg
    },

    subCursor(arg) {
        this.cursor -= arg
    },

    loadTempFromStorage() {
        this.temp = this.storage.get(this.cursor)
    },

    saveTempToStorage() {
        this.storage.set(this.cursor, this.temp)
    },

    addTempToStorage() {
        this.storage.set(this.cursor, this.storage.get(this.cursor) + this.temp)
    },

    subTempToStorage() {
        this.storage.set(this.cursor, this.storage.get(this.cursor) - this.temp)
    },

    multiplyTempToStorage() {
        this.storage.set(this.cursor, this.storage.get(this.cursor) * this.temp)
    },

    divideTempToStorage() {
        this.storage.set(this.cursor, this.storage.get(this.cursor) / this.temp)
    },

    input() {
        const user = prompt()

        if (user == +user) {
            this.temp = +user
        } else {
            this.temp = user.charCodeAt(0)
        }
    },

    print() {
        this.print(this.temp)
    },

    printAsChar() {
        this.print(String.fromCharCode(this.temp))
    },

    linebreak() {
        this.print('\n')
    },

    jumpIfTempZero(arg) {
        if (this.temp == 0) {
            this.line = this.checkpoint.get(arg)
        }
    },

    jumpIfTempNotZero(arg) {
        if (this.temp != 0) {
            this.line = this.checkpoint.get(arg)
        }
    },

    setCheckpoint(arg) {
        this.checkpoint.set(arg, this.line)
    },
}

const mapToArray = (map) => {
    if (map.size == 0) return []

    const len = Math.max(...map.keys())
    const arr = new Array(len).fill(0)

    for (const [key, value] of map) {
        arr[key - 1] = value
    }

    return arr
}

const instructions = new Map()
instructions.set(2, instructionSet.exit)
instructions.set(8, instructionSet.setTemp)
instructions.set(9, instructionSet.addTemp)
instructions.set(10, instructionSet.subTemp)
instructions.set(11, instructionSet.mulTemp)
instructions.set(12, instructionSet.divTemp)
instructions.set(13, instructionSet.modTemp)
instructions.set(16, instructionSet.setCursor)
instructions.set(17, instructionSet.addCursor)
instructions.set(18, instructionSet.subCursor)
instructions.set(32, instructionSet.loadTempFromStorage)
instructions.set(33, instructionSet.saveTempToStorage)
instructions.set(34, instructionSet.addTempToStorage)
instructions.set(35, instructionSet.subTempToStorage)
instructions.set(36, instructionSet.multiplyTempToStorage)
instructions.set(37, instructionSet.divideTempToStorage)
instructions.set(64, instructionSet.input)
instructions.set(65, instructionSet.print)
instructions.set(66, instructionSet.printAsChar)
instructions.set(67, instructionSet.linebreak)
instructions.set(72, instructionSet.jumpIfTempZero)
instructions.set(73, instructionSet.jumpIfTempNotZero)
instructions.set(74, instructionSet.setCheckpoint)

const outputTextarea = document.getElementById('output')
const inputTextarea = document.getElementById('input')
const runButton = document.getElementById('run')

const display = {
    cursor: document.getElementById('cursor'),
    line: document.getElementById('line'),
    temp: document.getElementById('temp'),
    storage: document.getElementById('storage'),
}

class ObservableMap extends Map {
    constructor(onSet) {
        super()
        this.onSet = onSet
    }
    set(key, value) {
        super.set(key, value)
        this.onSet(key, value)
    }
}

let interval = 10

document.getElementById('speed').addEventListener('input', (e) => {
    interval = e.target.valueAsNumber
})

function drawStorage() {
    display.storage.firstChild.remove()
    const wrapper = document.createElement('div')
    wrapper.classList.add('h')

    for (const num of mapToArray(this)) {
        const div = document.createElement('input')
        div.disabled = true
        div.value = num
        wrapper.appendChild(div)
    }

    display.storage.appendChild(wrapper)
}

class Logic {
    async run(code) {
        this.line = 0
        this.cursor = 0
        this.temp = 0
        this.storage = new ObservableMap(drawStorage)
        this.checkpoint = new Map()
        while (this.line < code.length) {
            await new Promise((resolve) => setTimeout(resolve, interval))
            const [instruction, operand] = code[this.line]
            instructions.get(instruction).call(this, operand)
            display.line.value = this.line
            display.cursor.value = this.cursor
            display.temp.value = this.temp

            // console.log(
            //     'line:',
            //     this.line,
            //     'inst:',
            //     instructions.get(instruction).name,
            //     'temp:',
            //     this.temp,
            //     'storage:',
            //     mapToArray(this.storage),
            //     'cursor:',
            //     this.cursor
            // )
            this.line++
        }
    }
    exit(exitCode) {
        throw new Error('exit')
    }
    print(text) {
        // console.log('STDOUT:', text)
        outputTextarea.value += text
    }
}

// // To print 구구단,
// // 0번째 변수: M
// // 1번째 변수: N
// // 2번째 변수: M * N
// // 3번째 변수: 9번 반복 확인용 J
// // 4번째 변수: 8번 반복 확인용 K

// const risc = [
//     ['setTemp', 1], // M 초기화
//     ['setCursor', 1],
//     ['saveTempToStorage'],
//     ['setTemp', 9], // J 초기화
//     ['setCursor', 4],
//     ['saveTempToStorage'], // 체크포인트 1번
//     ['setCheckpoint', 1], // M 증가
//     ['setCursor', 1],
//     ['loadTempFromStorage'],
//     ['addTemp', 1],
//     ['saveTempToStorage'], // J 감소
//     ['setCursor', 4],
//     ['loadTempFromStorage'],
//     ['subTemp', 1],
//     ['jumpIfTempZero', 3],
//     ['saveTempToStorage'], // N 초기화
//     ['setTemp', 1],
//     ['setCursor', 2],
//     ['saveTempToStorage'], // K 초기화
//     ['setTemp', 9],
//     ['setCursor', 5],
//     ['saveTempToStorage'], // 체크포인트 2번
//     ['setCheckpoint', 2], // N 증가
//     ['setCursor', 2],
//     ['loadTempFromStorage'],
//     ['addTemp', 1],
//     ['saveTempToStorage'], // K 감소
//     ['setCursor', 5],
//     ['loadTempFromStorage'],
//     ['subTemp', 1],
//     ['jumpIfTempZero', 1],
//     ['saveTempToStorage'], // M * N 계산
//     ['setCursor', 1],
//     ['loadTempFromStorage'],
//     ['setCursor', 3],
//     ['saveTempToStorage'],
//     ['setCursor', 2],
//     ['loadTempFromStorage'],
//     ['setCursor', 3],
//     ['multiplyTempToStorage'], // M * N 출력
//     ['setCursor', 1], // M 출력
//     ['loadTempFromStorage'],
//     ['print'],
//     ['setTemp', 32], // " " 출력
//     ['printAsChar'],
//     ['setTemp', 88], // "X" 출력
//     ['printAsChar'],
//     ['setTemp', 32], // " " 출력
//     ['printAsChar'],
//     ['setCursor', 2], // N 출력
//     ['loadTempFromStorage'],
//     ['print'],
//     ['setTemp', 32], // " " 출력
//     ['printAsChar'],
//     ['setTemp', 61], // ""=" 출력
//     ['printAsChar'],
//     ['setTemp', 32], // " " 출력
//     ['printAsChar'],
//     ['setCursor', 3], // M * N 출력
//     ['loadTempFromStorage'],
//     ['print'],
//     ['linebreak'],
//     ['jumpIfTempNotZero', 2], // 체크포인트 2번으로 이동
//     ['setCheckpoint', 3], // 체크포인트 3번 설정 (종료)
//     ['exit', 0],
// ].filter((e) => e.length)

// const instructionToCode = (instruction) => {
//     for (const [key, value] of instructions) {
//         if (value.name == instruction) return key
//     }
// }

// const assembly = risc.map(([instruction, operand]) => [
//     instructionToCode(instruction),
//     operand ?? 1,
// ])

// console.log(
//     assembly
//         .flat()
//         .map((e) => {
//             if (Math.random() < 0.5) {
//                 return e.toString(2).replaceAll('0', '연').replaceAll('1', '고')
//             } else {
//                 return e.toString(2).replaceAll('1', '연').replaceAll('0', '고')
//             }
//         })
//         .join(' ')
// )
// logic.run(assembly)

inputTextarea.value = `연고고고 연 고연연연연 고 연고고고고연 고 연고고고 연고고연 고연연연연 고연연 고연연연연고 연 고연연고연고연 고 고연연연연 고 연고고고고고 연 연고고연 연 연고고고고연 고 연고고고고 연고고 고연연연연연 고 연고연고 연 연고고연고고고 연연 연고고고고연 고 연고고고 연 고연연연연 고연 연고고고고연 고 연고고고 연고고연 고연연연연 고연고 고연연연연고 연 연고고연고연고 연고 고연연연연 고연 고연연연연연 연 연고고연 연 연고고고고연 고 연고고고고 고연고 연고고고고고 연 고연고연 고 연고고연고고고 고 고연연연연고 고 고연연연연 연 고연연연연연 고 고연연연연 연연 고연연연연고 고 고연연연연 고연 고연연연연연 고 연고고고고 고고 고연연고연연 연 연고고고고 고 고연연연연연 고 고연연연연연고 고 연고고고 연고고고고고 연고고고고연고 고 연고고고 고연고고연연연 연고고고고연고 연 연고고고 고연연연연연 고연연연연고연 고 고연연연연 연고 연고고고고고 고 연고고고고고연 고 고연연연 고연연연연연 고연연연연고연 연 고연연연 고고고고연고 고연연연연고연 연 고연연연 연고고고고고 고연연연연고연 연 고연연연연 고고 고연연연연연 고 연고고고고고연 연 고연연연연고고 고 연고고연고고연 연고 연고고연고연고 고고 고연 연`

function gyeono(str) {
    const first = str[0]
    return parseInt([...str].map((e) => +(e === first)).join(''), 2)
}

function run() {
    const code = []
    let isInstruction = true

    for (const num of inputTextarea.value.split(/[ \n]/g).map(gyeono)) {
        if (isInstruction) {
            code.push([num])
        } else {
            code[code.length - 1].push(num)
        }
        isInstruction = !isInstruction
    }

    const logic = new Logic()
    logic.run(code)
}

runButton.addEventListener('click', run)
run()
