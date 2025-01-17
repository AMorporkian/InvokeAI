import { Flex } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import {
  clearInitialImage,
  initialImageChanged,
} from 'features/parameters/store/generationSlice';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { generationSelector } from 'features/parameters/store/generationSelectors';
import { defaultSelectorOptions } from 'app/store/util/defaultMemoizeOptions';
import { configSelector } from '../../../../system/store/configSelectors';
import { useAppToaster } from 'app/components/Toaster';
import IAIDndImage from 'common/components/IAIDndImage';
import { ImageDTO } from 'services/api';
import { IAIImageFallback } from 'common/components/IAIImageFallback';

const selector = createSelector(
  [generationSelector],
  (generation) => {
    const { initialImage } = generation;
    return {
      initialImage,
    };
  },
  defaultSelectorOptions
);

const InitialImagePreview = () => {
  const { initialImage } = useAppSelector(selector);
  const { shouldFetchImages } = useAppSelector(configSelector);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const toaster = useAppToaster();

  const handleError = useCallback(() => {
    dispatch(clearInitialImage());
    if (shouldFetchImages) {
      toaster({
        title: 'Something went wrong, please refresh',
        status: 'error',
        isClosable: true,
      });
    } else {
      toaster({
        title: t('toast.parametersFailed'),
        description: t('toast.parametersFailedDesc'),
        status: 'error',
        isClosable: true,
      });
    }
  }, [dispatch, t, toaster, shouldFetchImages]);

  const handleDrop = useCallback(
    (droppedImage: ImageDTO) => {
      if (droppedImage.image_name === initialImage?.image_name) {
        return;
      }
      dispatch(initialImageChanged(droppedImage));
    },
    [dispatch, initialImage?.image_name]
  );

  const handleReset = useCallback(() => {
    dispatch(clearInitialImage());
  }, [dispatch]);

  return (
    <Flex
      sx={{
        width: 'full',
        height: 'full',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <IAIDndImage
        image={initialImage}
        onDrop={handleDrop}
        onReset={handleReset}
        fallback={<IAIImageFallback sx={{ bg: 'none' }} />}
      />
    </Flex>
  );
};

export default InitialImagePreview;
