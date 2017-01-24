// Create a rectangle shaped path with its top left point at
// {x: 75, y: 75} and a size of {width: 75, height: 75}
var path = new Path.Rectangle({
    point: [75, 75],
    size: [75, 75],
    strokeColor: 'black'
});

function onFrame(event) {
    console.log("onFrame called");
    // Your animation code goes in here
    path.rotate(3);

}
