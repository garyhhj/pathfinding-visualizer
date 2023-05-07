/*********************
 * global variables  
 *********************/
//commonly used colors 
//const bgColor = '#383838';
const blockNodeColor = 'black'; 
const startNodeColor = 'green'; 
const endNodeColor = 'yellow'; 
const nodePathColor = 'green'; 
const searchNodeColor = 'yellow'; 
//const searchNodeColorNOpacity = 'rgba(255, 255, 255, 1)';
const borderColor = '#ddd2c9';
const buttonDefaultColor = 'aliceblue'; 
const buttonAccentColor = 'aquamarine'; 

//start and end nodes 
const UNINITIALIZED= -1; 
var startRow = UNINITIALIZED; 
var startCol = UNINITIALIZED; 
var endRow = UNINITIALIZED; 
var endCol = UNINITIALIZED; 

//drawing modes 
const DRAWBLOCK = 1; 
const DRAWSTART = 2; 
const DRAWEND = 3; 
var drawOption = DRAWSTART;  

//algo selection
const DIJKSTRA = 1; 
const ASTAR = 2; 
var algoOption = DIJKSTRA; 

//mouse event
var mousedown = false; 

//graph
var prevNodeGraph = []; 
var visited = [];


/*********************
 * query selector
 *********************/
const graphContainer = document.querySelector('#graphContainer'); 
const clear = document.querySelector('#clear')

const blockButton = document.querySelector('#blockedNode'); 
const startButton = document.querySelector('#startNode');
const endButton = document.querySelector('#endNode');  

const dijkstraButton = document.querySelector('#Dijkstra'); 
const aStarButton = document.querySelector('#Astar'); 
const searchButton = document.querySelector('#search');

const mazeButton = document.querySelector('#genMaze'); 


/*********************
 * interface 
 *********************/

/*********************
 * buttons 
 *********************/
// const dijkstraButton = document.querySelector('#Dijkstra'); 
// const aStarButton = document.querySelector('#Astar'); 
// const RIPAButton = document.querySelector('#RIPA'); 
// const searchButton = document.querySelector('#search');


clear.addEventListener('click', resetGraph); 

blockButton.addEventListener('click', blockSelector); 
startButton.addEventListener('click', startSelector); 
endButton.addEventListener('click', endSelector); 

dijkstraButton.addEventListener('click', dijkstraSelector); 
aStarButton.addEventListener('click', aStarSelector); 
searchButton.addEventListener('click', searchSelector); 

mazeButton.addEventListener('click', generateMaze); 

/*********************
 * drawing nodes 
 *********************/
//buttons for drawing nodes 
function setNodeSelectorColor(color){
    blockButton.style.color = color;
    startButton.style.color = color; 
    endButton.style.color = color;  
} 

function blockSelector(){
    drawOption = DRAWBLOCK;
    setNodeSelectorColor(buttonDefaultColor); 
    blockButton.style.color = buttonAccentColor;     
}

function startSelector(){
    drawOption = DRAWSTART; 
    setNodeSelectorColor(buttonDefaultColor); 
    startButton.style.color = buttonAccentColor; 
}

function endSelector(){
    drawOption = DRAWEND; 
    setNodeSelectorColor(buttonDefaultColor); 
    endButton.style.color = buttonAccentColor; 
}

//reset button 
function resetGraph(){
    startRow = UNINITIALIZED; 
    startCol = UNINITIALIZED; 
    endRow = UNINITIALIZED; 
    endCol = UNINITIALIZED; 

    let nodeRow = document.getElementsByClassName('nodeRow');
    const nNodeRow = nodeRow.length; 
    for(let i = nNodeRow - 1; i >= 0; --i){
        nodeRow[i].remove(); 
    }

    createGraph(); 
}

function createGraph(){
    const unit =  50; 
    const rows =  Math.floor(window.innerHeight / unit  * 0.8);
    const columns =  Math.floor(window.innerWidth / unit) - 1;  
    
    prevNodeGraph = []; 
    visited = []; 
    for(let row = 0; row < rows; ++row){
        prevNodeGraph[row] = []; 
        visited[row] = [];
        for(let col = 0; col < columns; ++col){
            prevNodeGraph[row][col] = [-1, -1]; 
            visited[row][col] = false; 
        }
    }

    const graphContainer = document.getElementById('graphContainer'); 
    for(let row = 0; row < rows; ++row){

        const rowDiv = document.createElement('div'); 
        
        rowDiv.id = `row${row}`;
        rowDiv.className = 'nodeRow'; 
        rowDiv.style.display = 'flex'; 
        rowDiv.style.flexDirection = 'row';  
        rowDiv.style.margin = '0px';
        rowDiv.style.border = '0px'; 
        rowDiv.style.padding = '0px'; 

        graphContainer.appendChild(rowDiv); 
        for(let col = 0; col < columns; ++col){
            const colDiv = document.createElement('div'); 
            colDiv.id = `row${row}col${col}`
            colDiv.className = 'node'; 

            colDiv.style.height = `${unit}px`; 
            colDiv.style.width = `${unit}px`; 
            colDiv.style.backgroundColor = searchNodeColor;  
            colDiv.style.opacity = "0%";  

            colDiv.style.margin = '0px'; 
            colDiv.style.padding = '0px'; 

            const colDivContainer = document.createElement('div'); 
            colDivContainer.style.border = `1px solid ${borderColor}`;

            colDivContainer.appendChild(colDiv); 
            rowDiv.appendChild(colDivContainer); 
        }
    }
}

/*********************
 * calling algorithm 
 *********************/

function setSearchSelectorColor(color){
    dijkstraButton.style.color = color; 
    aStarButton.style.color = color; 
}

function dijkstraSelector(){
    setSearchSelectorColor(buttonDefaultColor); 

    algoOption = DIJKSTRA; 
    dijkstraButton.style.color = buttonAccentColor; 
}

function aStarSelector(){
    setSearchSelectorColor(buttonDefaultColor); 

    algoOption = ASTAR; 
    aStarButton.style.color = buttonAccentColor; 
}

//need async? idk 
function searchSelector(){
    switch(algoOption){
        case DIJKSTRA:
            dijkstra(); 
            break; 
        case ASTAR: 
            astar(); 
            break; 
    }
}

/*********************
 * mouse
 *********************/
graphContainer.addEventListener('mousedown', processMousedown); 
graphContainer.addEventListener('mousemove', processMousemove);
graphContainer.addEventListener('mouseup', processMouseup); 


function draw(event){
    switch(drawOption){
        case DRAWBLOCK:
            event.target.style.backgroundColor = blockNodeColor; 
            event.target.style.opacity = '100%'; 
            break; 
        case DRAWSTART:
            event.target.style.backgroundColor = startNodeColor; 
            event.target.style.opacity = '100%';
            break; 
        case DRAWEND:
            event.target.style.backgroundColor = endNodeColor;
            event.target.style.opacity = '100%';
            break; 
    }
}

function getRowAndCol(str){
    //row9col29
    let prevIndex = 3; 
    for(let index = 3; index < str.length; ++index){
        if(prevIndex == 3 && (str[index] < '0' || str[index] > '9')){

            let row = Number(str.substring(prevIndex, index)); 
            let col = Number(str.substring(index + 3, str.length));

            switch(drawOption) {
                case DRAWBLOCK:
                    break; 
                case DRAWSTART:
                    startRow = row; 
                    startCol = col; 
                    break; 
                case DRAWEND:
                    endRow = row; 
                    endCol = col;                     
                    break; 
            }
            
            return [row, col]; 
        }
    }
}

function setVisited(pairRowCol){
    if(drawOption == DRAWBLOCK){
        visited[pairRowCol[0]][pairRowCol[1]] = true;
    }
}

function resetPreviousBackground(){
    if(drawOption == DRAWBLOCK){
        return; 
    }
    
    if((drawOption == DRAWSTART && startRow != UNINITIALIZED) ||
        (drawOption == DRAWEND &&endRow != UNINITIALIZED) ){
        
        const nodeId = (drawOption == DRAWSTART ? `row${startRow}col${startCol}` : `row${endRow}col${endCol}`); 
        const node = document.getElementById(nodeId); 
        node.style.backgroundColor = searchNodeColor;  
        node.style.opacity = '0%'; 
    }
}

function processMousedown(event){
    mousedown = true; 
    draw(event); 
    resetPreviousBackground(); 
    setVisited(getRowAndCol(event.target.id)); 
}

function processMousemove(event){
    if(!mousedown || 
        drawOption == DRAWSTART || drawOption == DRAWEND){
        return; 
    }

    draw(event); 
    setVisited(getRowAndCol(event.target.id)); 
}

function processMouseup(){
    mousedown = false; 
}

/*********************
 * animate
 *********************/
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*********************
 * algorithms 
 *********************/

/*********************
 * utility
 *********************/
const directionArray = [1, 0, -1, 0, 1]; 

function inRange(row, col){
    if(row == -1 || col == -1) return false; 
    if(row >= visited.length || col >= visited[0].length) return false; 
    return true; 
}

async function drawPath(){
    let path = []; 
    path.push([endRow, endCol]); 
    let currRow = endRow; 
    let currCol = endCol;    
    while(currRow != startRow || currCol != startCol){
        path.push([prevNodeGraph[currRow][currCol][0], prevNodeGraph[currRow][currCol][1]]);
        
        currRow = path[path.length - 1][0]; 
        currCol = path[path.length - 1][1]; 
    }

    for(let i = path.length - 1; i >= 0; --i){
        const node = document.getElementById(`row${path[i][0]}col${path[i][1]}`);
        await sleep(5); 
        node.style.backgroundColor = nodePathColor;
    }
}

function initDistance(row, col){
    let distance = []; 
    for(let i = 0; i < visited.length; ++i){
        distance.push([]); 
        for(let j = 0; j < visited[0].length; ++j){
            distance[i][j] = Math.sqrt((i - row) ** 2 + (j - col) ** 2); 
        }
    }
 
    return distance; 
}

/*********************
 * binary heap  
 *********************/
class BinaryHeap{
    heap; 

    constructor(){
        this.heap = []; 
    }

    leftChildIndex(i){
        return 2 * i + 1; 
    }

    rightChildIndex(i){
        return 2 * i + 2; 
    }

    parentIndex(i){
        return Math.floor((i  - 1)/ 2); 
    }

    peek(){
        if(this.heap.length > 0){
            return this.heap[0]; 
        }
        return null; 
    }

    insert(row, col, weight){
        let heap = this.heap; 
        heap.push([row, col, weight]); 
        
        let index = heap.length - 1;  
        while(index > 0 && heap[this.parentIndex(index)][2] > heap[index][2]){
            //
            let parentIndex = this.parentIndex(index); 
            this.swap(index, parentIndex); 
            index = parentIndex; 
        }
    }

    pop(){
        let heap = this.heap; 

        heap[0][0] = heap[heap.length - 1][0];
        heap[0][1] = heap[heap.length - 1][1];
        heap[0][2] = heap[heap.length - 1][2];
        heap.pop(); 
        
        let index = 0; 
        for(;;){
            let minIndex = index; 
            if(this.leftChildIndex(index) < heap.length && heap[this.leftChildIndex(index)][2] < heap[index][2]){
                minIndex = this.leftChildIndex(index); 
            }

            if(this.rightChildIndex(index) < heap.length && heap[this.rightChildIndex(index)][2] < heap[minIndex][2]) {
                minIndex = this.rightChildIndex(index); 
            }


            if(minIndex != index){
                //do something; 
                this.swap(index, minIndex); 
                index = minIndex; 
            }
            else{
                break; 
            }
        }
    }

    empty(){
        return this.heap.length == 0; 
    }

    swap(currIndex, indexToSwap){
        let temp = [this.heap[currIndex][0], this.heap[currIndex][1], this.heap[currIndex][2]];
        this.heap[currIndex] = [this.heap[indexToSwap][0], this.heap[indexToSwap][1], this.heap[indexToSwap][2]];
        this.heap[indexToSwap] = [temp[0], temp[1], temp[2]]; 
    }
}

/*********************
 * Dijkstra  
 *********************/

//can I dijkstra : something
async function dijkstra(){
    if(startRow == UNINITIALIZED){
        return; 
    }
    
    let pathFound = false; 
    let heap = new BinaryHeap; 
    heap.insert(startRow, startCol, 0); 

    while(!heap.empty()){
        const currNode = heap.peek(); 
        const currRow = currNode[0]; 
        const currCol = currNode[1]; 
        const currWeight = currNode[2]; 
        heap.pop(); 

        await sleep(2); 

        const currNodeDiv = document.getElementById(`row${currRow}col${currCol}`); 
        currNodeDiv.style.opacity = '100%'; 


        if(currRow == endRow && currCol == endCol){
            pathFound = true; 
            break; 
        }

        for(let i = 0; i < 4; ++i){
            const nextRow = currRow + directionArray[i]; 
            const nextCol = currCol + directionArray[i + 1]; 

            if(await inRange(nextRow, nextCol) && !visited[nextRow][nextCol]){
                visited[currRow][currCol] = true; 
                heap.insert(nextRow, nextCol, currWeight + 1); 
                prevNodeGraph[nextRow][nextCol] = [currRow, currCol]; 
            }
        }
    }

    if(pathFound){
        await drawPath(); 
    }
}

/*********************
 * A Star  
 *********************/

async function astar(){
    if(startRow == UNINITIALIZED){
        return; 
    }

    let distanceFromStart = await initDistance(startRow, startCol);
    let distanceFromEnd = await initDistance(endRow, endCol); 


    let pathFound = false; 
    let heap = new BinaryHeap; 
    heap.insert(startRow, startCol, 0); 

    while(!heap.empty()){
        const currNode = heap.peek(); 
        const currRow = currNode[0]; 
        const currCol = currNode[1]; 
        heap.pop(); 

        await sleep(2); 

        const currNodeDiv = document.getElementById(`row${currRow}col${currCol}`); 
        currNodeDiv.style.opacity = '100%'; 


        if(currRow == endRow && currCol == endCol){
            pathFound = true; 
            break; 
        }
        


        for(let i = 0; i < 4; ++i){
            const nextRow = currRow + directionArray[i]; 
            const nextCol = currCol + directionArray[i + 1]; 

            if(await inRange(nextRow, nextCol) && !visited[nextRow][nextCol]){
                visited[currRow][currCol] = true; 
                heap.insert(nextRow, nextCol, distanceFromStart[nextRow][nextCol] + distanceFromEnd[nextRow][nextCol]); 
                prevNodeGraph[nextRow][nextCol] = [currRow, currCol]; 
            }
        }
    }

    if(pathFound){
        await drawPath(); 
    }
}


/*********************
 * maze generation  
 *********************/
function generateMaze(){
    //this will generate some random minimum spanning tree 

    //first need to generate random weights for graphs 

    let randomWeights = []; 
    for(let i = 0; i < visited.length; ++i){
        randomWeights.push([]); 
        for(let j = 0; j < visited[0].length; ++j){
            randomWeights[i][j] = Math.floor(Math.random() * 100); 
        }
    }

    //mark all nodes as false 
    let isWall = []; 
    for(let i = 0; i < visited.length; ++i){
        isWall.push([]); 
        for(let j = 0; j < visited[0].length; ++j){
            isWall[i][j] = true; 
        }
    }

    //assume everything is a wall 

    //starting cell 
    isWall[0][0] = false; 
    //add walls to the root 
    let wallList = new BinaryHeap; 
    wallList.insert(0, 1, randomWeights[0][1]); 
    wallList.insert(1, 0, randomWeights[1][0]); 

    
    while(!wallList.empty()){
        let pickedWall = wallList.peek(); 
        let currRow = pickedWall[0]; 
        let currCol = pickedWall[1]; 
        wallList.pop(); 

        let countVisited = 0; 
        for(let i = 0; i < 4; ++i){
            let nextRow = currRow + directionArray[i]; 
            let nextCol = currCol + directionArray[i + 1]; 
            if(inRange(nextRow, nextCol) && isWall[nextRow][nextCol] == false){
                ++countVisited;  
            }
        }

        if(countVisited == 1){
            isWall[currRow][currCol] = false; 
            for(let i = 0; i < 4; ++i){
                let nextRow = currRow + directionArray[i]; 
                let nextCol = currCol + directionArray[i + 1]; 
                if(inRange(nextRow, nextCol) && isWall[nextRow][nextCol] == true){
                    wallList.insert(nextRow, nextCol, randomWeights[nextRow][nextCol]); 
                }
            }
        }
    }
    
    for(let i = 0; i < visited.length; ++i){
        for(let j = 0; j < visited[0].length; ++j){
            if(isWall[i][j]){
                const node = document.getElementById(`row${i}col${j}`);
                node.style.backgroundColor = blockNodeColor;
                node.style.opacity = '100%'; 

                visited[i][j] = true;                  
            }
        }
    }
}

/*********************
 * loading webpage
 *********************/
createGraph(); 
