class Memory {
    canv: string = "";
    chunks = [];
    xmin: number = 0;
    xmax: number = 0;
    cwid: number = 512;
    cursx: number = 0;
    lasttick: number = 0;
    windx: number = 3000;
    windy: number = 800;
    planmtx: number[] = [];
};

const MEM: Memory = new Memory();

export { MEM };