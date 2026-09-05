import ConfirmationDialog from '@base/components/ConfirmationDialog';
import { ImagePaths } from '@lib/constant';
import { getAccess } from '@modules/auth/lib/utils/client';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Drawer, Form, Image, Table, Tag, message } from 'antd';
import React, { useState } from 'react';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { GalleryHooks } from '../lib/hooks';
import { IGallery } from '../lib/interfaces';
import GalleryForm from './GalleryForm';

interface IProps {
  isLoading: boolean;
  data: IGallery[];
  pagination: PaginationProps;
  onSelectionChange?: (selectedRowKeys: React.Key[]) => void;
}

const GalleryList: React.FC<IProps> = ({ isLoading, data, pagination, onSelectionChange }) => {
  const [messageApi, messageHolder] = message.useMessage();
  const [formInstance] = Form.useForm();
  const [updateItem, setUpdateItem] = useState<IGallery>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    title: string;
    content: string;
    onConfirm: () => void;
  }>({ open: false, title: '', content: '', onConfirm: () => {} });

  const galleryUpdateFn = GalleryHooks.useUpdate({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }

        setUpdateItem(null);
        messageApi.success(res.message);
      },
    },
  });

  const galleryDeleteFn = GalleryHooks.useDelete({
    config: {
      onSuccess: (res) => {
        if (!res.success) {
          messageApi.error(res.message);
          return;
        }
        messageApi.success(res.message);
      },
    },
  });

  const dataSource = data?.map((elem) => ({
    key: elem?.id,
    id: elem?.id,
    url: elem?.url,
    title: elem?.title,
    caption: elem?.caption,
    source: elem?.source,
    altText: elem?.altText,
    type: elem?.type,
    createdAt: elem?.createdAt,
  }));

  const columns: TableColumnsType<(typeof dataSource)[number]> = [
    {
      key: 'url',
      dataIndex: 'url',
      title: 'Image',
      width: 96,
      render: (url) =>
        url ? (
          <Image
            src={url}
            alt="gallery"
            width={64}
            height={64}
            className="object-cover rounded-md border border-gray-200"
            fallback={ImagePaths.notFound}
          />
        ) : (
          'N/A'
        ),
    },
    {
      key: 'title',
      dataIndex: 'title',
      title: 'Title',
      render: (title) => title || 'N/A',
    },
    {
      key: 'altText',
      dataIndex: 'altText',
      title: 'Alt Text',
      render: (altText) => altText || 'N/A',
    },
    {
      key: 'source',
      dataIndex: 'source',
      title: 'Source',
      render: (source) => source || 'N/A',
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: 'Type',
      render: (type) => (type ? <Tag>{type}</Tag> : 'N/A'),
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: 'Uploaded At',
    },
    {
      key: 'id',
      dataIndex: 'id',
      title: 'Action',
      align: 'center',
      render: (id) => {
        const item = data?.find((item) => item.id === id);
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Button
              onClick={() => {
                getAccess(['gallery:update'], () => {
                  setUpdateItem(item);
                });
              }}
            >
              <AiFillEdit />
            </Button>
            <Button
              danger
              onClick={() => {
                getAccess(['gallery:delete'], () => {
                  setConfirmationDialog({
                    open: true,
                    title: 'Delete Gallery Item',
                    content: `Are you sure you want to delete "${item?.title || item?.url}"?`,
                    onConfirm: () => {
                      galleryDeleteFn.mutate(item.id);
                      setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} });
                    },
                  });
                });
              }}
            >
              <AiFillDelete />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      {messageHolder}
      <Table
        loading={isLoading}
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        scroll={{ x: true }}
        rowSelection={
          onSelectionChange
            ? {
                onChange: onSelectionChange,
              }
            : undefined
        }
      />
      <Drawer
        width={640}
        title={`Update ${updateItem?.title || 'Gallery Item'}`}
        open={!!updateItem?.id}
        onClose={() => setUpdateItem(null)}
      >
        <GalleryForm
          formType="update"
          form={formInstance}
          initialValues={updateItem}
          isLoading={galleryUpdateFn.isPending}
          onFinish={(values) =>
            galleryUpdateFn.mutate({
              id: updateItem?.id,
              data: values,
            })
          }
        />
      </Drawer>
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={confirmationDialog.onConfirm}
        onCancel={() => setConfirmationDialog({ open: false, title: '', content: '', onConfirm: () => {} })}
      />
    </React.Fragment>
  );
};

export default GalleryList;