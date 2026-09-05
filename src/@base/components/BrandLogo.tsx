import { ImagePaths } from '@lib/constant';
import { SettingsHooks } from '@modules/settings/lib/hooks';
import React from 'react';

interface IProps {
  className?: string;
  isBrand?: boolean;
  height?: number;
}

const BrandLogo: React.FC<IProps> = ({ className, isBrand = true, height = 50 }) => {
  const settingsQuery = SettingsHooks.useFindQuick({ config: { queryKey: [], enabled: isBrand } });

  if (settingsQuery.isLoading) {
    return null;
  }

  const renderImageFn = (src: string) => {
    const altText = (settingsQuery.data?.data?.initialName ?? 'Brand') + ' logo';

    return (
      <img
        fetchPriority="high"
        src={src}
        alt={altText}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          maxHeight: `${height}px`,
          objectFit: 'contain',
        }}
      />
    );
  };

  return renderImageFn(settingsQuery.data?.data?.logo || ImagePaths.logo);
};

export default BrandLogo;
