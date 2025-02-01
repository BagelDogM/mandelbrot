function transform(x, y, center, size, canvas_size) {
    var x_boundleft = center[0] - (size / 2.0);
    var x_boundright = center[0] + (size / 2.0);
    var y_boundleft = center[1] - (size/ 2.0);
    var y_boundright = center[1] + (size / 2.0);
    
    var xboundrange = (x_boundright - x_boundleft);
    var yboundrange = (y_boundright - y_boundleft);
    
    var xtransform = xboundrange / canvas_size;
    var ytransform = yboundrange / canvas_size;
    
    return [x * xtransform + x_boundleft, y * ytransform + y_boundleft];
}

function calculate_new_center(center, size, click, canvas_size, zoom) {
    // _m indicates mandelrbot co-ordinates.
    var click_m = transform(click[0], click[1], center, size, canvas_size);

    // Get the distance from the click to the current center
    var xdist_m = center[0]-click_m[0];
    var ydist_m = center[1]-click_m[1];

    // modify it by the zoom
    xdist_m /= zoom;
    ydist_m /= zoom;

    // create a new center using the modified co-ords.
    center = [xdist_m+click_m[0], ydist_m+click_m[1]];
    size = size/zoom;

    return center;
}

export {transform, calculate_new_center}