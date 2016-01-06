function Triangle(x1, y1, x2, y2, x3, y3) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
}
Triangle.prototype = {

    // returns true if the given x,y point lies within the triangle
    contains: function(x, y) {
        return Triangle.isPointInside(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3, x, y);
    }
};
Triangle.isPointInside = function(x1, y1, x2, y2, x3, y3, px, py) {
    var p12 = (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
    var p23 = (px - x3) * (y2 - y3) - (x2 - x3) * (py - y3);
    var p31 = (px - x1) * (y3 - y1) - (x3 - x1) * (py - y1);

    return p12 < 0 && p23 < 0 && p31 < 0;
}
