import React, {useEffect, useRef} from 'react';
import Mirador from 'mirador';

interface Props {
    manifestUrl: string;
    height?: string | number;
}

const MiradorViewer: React.FC<Props> = ({manifestUrl, height = '60vh'}) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref.current || !manifestUrl) return;

        ref.current.innerHTML = '';

        const config = {
            id: ref.current.id,

            windows: [
                {
                    loadedManifest: manifestUrl,
                    thumbnailNavigationPosition: 'far-right',
                },
            ],

            window: {
                allowClose: false,
                allowMaximize: false,
                allowFullscreen: true,
                allowTopMenuButton: true,
                defaultSideBarPanel: 'info',
                sideBarOpenByDefault: false,
                views: [{key: 'single'}, {key: 'gallery'}],
            },

            workspace: {
                showZoomControls: true,
                type: 'mosaic',
            },

            workspaceControlPanel: {
                enabled: false,
            },
        };

        Mirador.viewer(config);

        return () => {
            if (ref.current) ref.current.innerHTML = '';
        };
    }, [manifestUrl]);

    return (
        <div
            id={`mirador-${Math.random().toString(36).slice(2)}`}
            ref={ref}
            style={{
                height,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                minHeight: '70vh',
            }}
        />
    );
};

export default MiradorViewer;