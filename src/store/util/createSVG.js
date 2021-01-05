import store from './../store';

export function createSVG() {
    /* for now this provides just a very basic functionality */
    const div = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    const viewBox = store.state.viewBox;

    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    svg.setAttribute('width', viewBox.x);
    svg.setAttribute('height', viewBox.y);
    svg.setAttribute('viewBox', `0 0 ${viewBox.x} ${viewBox.y}`);

    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('fill', 'none');

    store.state.allPaths.forEach( p => {
        if (!p.definition.length) return;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const fill = p.hasFill ? 'currentColor' : 'none';
        let d = "";
        p.definition.forEach(s => {
            d += ['', s.type, s.curve1.x, s.curve1.y, s.curve2.x, s.curve2.y, s.dest.x, s.dest.y]
                .map( n  => {
                    if (typeof n === 'number') {
                        //round to 2 decimals
                        n = Math.round((n + Number.EPSILON) * 100) / 100
                    }
                    return n;
                })
                .join(' ')
                .replace(/\s+/g,' '); //remove whitespace caused by empty values
        });
        if (p.isClosed) d += ' Z';

        path.setAttribute('d', d);
        path.setAttribute('stroke-width', p.strokeWidth);
        path.setAttribute('stroke-linejoin', p.strokeLinejoin);
        path.setAttribute('stroke-linecap', p.strokeLinecap);
        path.setAttribute('fill', fill);

        svg.appendChild(path);
    } )

    div.appendChild(svg);

    return div.innerHTML;
}
