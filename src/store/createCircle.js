/* createCircle 
 * creates a path definition for a circle.
 * the center has to be an object with x and y coordintates.
 * @param {object} center
 * @param {number} radius
 * @public 
*/

const createCircle = function(center, radius) {
    console.log('createCircle', center, radius);

    const b = 0.552284749831; //https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
    const r = radius;
    const s = {
      x: center.x - radius,
      y: center.y,
    }
    let d = []; //path definition

    function createId() {
        return new Date().getTime();
    }

    d.push({
        type: 'M',
        id: createId(),
        curve1: {},
        curve2: {},
        dest: {
          x: s.x,
          y: s.y
        }
      })
    d.push({
        type: 'C',
        id: createId() + 1,
        curve1: {
            x: s.x,
            y: s.y - r * b,
        },
        curve2: {
            x: s.x + r - r * b,
            y: s.y - r
        },
        dest: {
          x: s.x + r,
          y: s.y - r
        }
      })
    d.push({
        type: 'C',
        id: createId() + 2,
        curve1: {
            x: s.x + r + r * b,
            y: s.y - r,
        },
        curve2: {
            x: s.x + 2 * r,
            y: s.y - r * b
        },
        dest: {
          x: s.x + 2 * r,
          y: s.y
        }
      })
    d.push({
        type: 'C',
        id: createId() + 3,
        curve1: {
            x: s.x + 2 * r,
            y: s.y + r * b,
        },
        curve2: {
            x: s.x + r + r * b,
            y: s.y + r
        },
        dest: {
          x: s.x + r,
          y: s.y + r
        }
      })
    d.push({
        type: 'C',
        id: createId() + 4,
        curve1: {
            x: s.x + r - r * b,
            y: s.y + r,
        },
        curve2: {
            x: s.x,
            y: s.y + r * b
        },
        dest: {
          x: s.x,
          y: s.y
        }
      })
    d.push({
        type: 'Z',
        id: createId() + 5,
        curve1: {},
        curve2: {},
        dest: {}
      })
    return d;
}

export default createCircle;