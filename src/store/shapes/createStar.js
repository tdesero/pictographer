/* createStar
 * creates a (path definition for) a Star.
 * the center has to be an object with x and y coordintates.
 * @param {object} center
 * @param {number} radius
 * @public 
*/

const createStar = function(center, outerRadius, innerRadius, armsNumber) {
    console.log('createStar', center, outerRadius, innerRadius, armsNumber);

    const r1 = outerRadius; //outer radius
    const r2 = innerRadius; //inner radius
    const c = center; //center
    const arms = armsNumber;
    const a = Math.PI/arms*2; //angle
    let d = []; //path definition

    let j = 0;

    function createId() {
        return new Date().getTime();
    }

    /* star */
    for (let i = 0; i <= arms; i++) {
      let p1 = {};
      p1.x = c.x + Math.sin(i * a) * r1;
      p1.y = c.y + Math.cos(i * a) * r1;

      j += i;
      
      let t = (i === 0) ? 'M' : 'L';
      
      d.push({
        type: t,
        id: createId() + j,
        curve1: {},
        curve2: {},
        dest: {
          x: p1.x,
          y: p1.y
        }
      })
      
      if (i < arms) {
      let p2 = {};
        p2.x = c.x + Math.sin((i + 0.5) * a) * r2;
        p2.y = c.y + Math.cos((i + 0.5) * a) * r2; 
        j += 1;
        
        d.push({
          type: 'L',
          id: createId() + j,
          curve1: {},
          curve2: {},
          dest: {
            x: p2.x,
            y: p2.y
          }
        })
      }
      
    }

    return d;
}

export default createStar;