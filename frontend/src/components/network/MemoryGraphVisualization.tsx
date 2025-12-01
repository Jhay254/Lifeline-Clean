'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
    id: string;
    name: string;
    email: string;
}

interface Edge {
    source: string;
    target: string;
    strength: number;
    relationshipType?: string;
    sharedEvents?: number;
}

interface GraphData {
    nodes: Node[];
    edges: Edge[];
}

interface Props {
    graph: GraphData;
}

export function MemoryGraphVisualization({ graph }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !graph.nodes.length) return;

        // Clear previous visualization
        d3.select(svgRef.current).selectAll('*').remove();

        const width = 800;
        const height = 600;

        const svg = d3
            .select(svgRef.current)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        // Create force simulation
        const simulation = d3
            .forceSimulation(graph.nodes as any)
            .force(
                'link',
                d3.forceLink(graph.edges).id((d: any) => d.id).distance(150)
            )
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30));

        // Draw links
        const link = svg
            .append('g')
            .selectAll('line')
            .data(graph.edges)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', (d: any) => Math.max(1, d.strength / 20));

        // Draw nodes
        const node = svg
            .append('g')
            .selectAll('circle')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('r', 12)
            .attr('fill', '#4f46e5')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .call(
                d3.drag<any, any>()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended) as any
            );

        // Add tooltips on hover
        node.append('title')
            .text((d: any) => `${d.name || d.email}\nClick for details`);

        // Add labels
        const label = svg
            .append('g')
            .selectAll('text')
            .data(graph.nodes)
            .enter()
            .append('text')
            .text((d: any) => d.name || d.email.split('@')[0])
            .attr('font-size', 12)
            .attr('dx', 15)
            .attr('dy', 4)
            .style('pointer-events', 'none');

        // Update positions on tick
        simulation.on('tick', () => {
            link
                .attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node
                .attr('cx', (d: any) => d.x)
                .attr('cy', (d: any) => d.y);

            label
                .attr('x', (d: any) => d.x)
                .attr('y', (d: any) => d.y);
        });

        function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        // Cleanup
        return () => {
            simulation.stop();
        };
    }, [graph]);

    return (
        <div className="relative w-full h-[600px] border rounded-lg bg-slate-50 dark:bg-slate-900">
            <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
    );
}
