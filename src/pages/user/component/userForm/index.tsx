import React, {
  useEffect,
  useState,
  useImperativeHandle,
  ReactNode,
} from 'react';
import { Form, Input, Select, Space, Button } from 'antd';
import { layout } from '../../const';
import { getUserInfo, getNotifyChannels } from '@/services/manage';
import {
  UserAndPasswordFormProps,
  Contacts,
  ContactsItem,
  User,
} from '@/store/manageInterface';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;
const UserForm = React.forwardRef<ReactNode, UserAndPasswordFormProps>(
  (props, ref) => {
    const { t } = useTranslation();
    const { userId } = props;
    const [form] = Form.useForm();
    const [initialValues, setInitialValues] = useState<User>();
    const [loading, setLoading] = useState<boolean>(true);
    const [contactsList, setContactsList] = useState<ContactsItem[]>([]);
    const roleList = [
      {
        value: 'Admin',
        label: t('管理员'),
      },
      {
        value: 'Standard',
        label: t('普通用户'),
      },
      {
        value: 'Guest',
        label: t('游客'),
      },
    ];
    useImperativeHandle(ref, () => ({
      form: form,
    }));
    useEffect(() => {
      if (userId) {
        getUserInfoDetail(userId);
      } else {
        setLoading(false);
      }

      getContacts();
    }, []);

    const getContacts = () => {
      getNotifyChannels().then((data: Array<ContactsItem>) => {
        setContactsList(data);
      });
    };

    const getUserInfoDetail = (id: string) => {
      getUserInfo(id).then((data: User) => {
        let contacts: Array<Contacts> = [];

        if (data.contacts) {
          Object.keys(data.contacts).forEach((item: string) => {
            let val: Contacts = {
              key: item,
              value: data.contacts[item],
            };
            contacts.push(val);
          });
        }

        setInitialValues(
          Object.assign({}, data, {
            contacts,
          }),
        );
        setLoading(false);
      });
    };

    return !loading ? (
      <Form
        {...layout}
        form={form}
        initialValues={initialValues}
        preserve={false}
      >
        {!userId && (
          <Form.Item
            label={t('用户名')}
            name='username'
            rules={[
              {
                required: true,
                message: t('用户名不能为空！'),
              },
            ]}
          >
            <Input />
          </Form.Item>
        )}
        <Form.Item label={t('显示名')} name='nickname'>
          <Input />
        </Form.Item>
        {!userId && (
          <>
            <Form.Item
              name='password'
              label={t('密码')}
              rules={[
                {
                  required: true,
                  message: t('请输入密码!'),
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name='confirm'
              label={t('确认密码')}
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: t('请确认密码!'),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('密码不一致!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}
        <Form.Item
          label={t('角色')}
          name='roles'
          rules={[
            {
              required: true,
              message: t('角色不能为空！'),
            },
          ]}
        >
          <Select mode='multiple'>
            {roleList.map((item, index) => (
              <Option value={item.value} key={index}>
                {item.value}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label={t('邮箱')} name='email'>
          <Input />
        </Form.Item>
        <Form.Item label={t('手机')} name='phone'>
          <Input />
        </Form.Item>
        <Form.Item label={t('更多联系方式')}>
          <Form.List name='contacts'>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space
                    key={key}
                    style={{
                      display: 'flex',
                    }}
                    align='baseline'
                  >
                    <Form.Item
                      style={{
                        width: '180px',
                      }}
                      {...restField}
                      name={[name, 'key']}
                      fieldKey={[fieldKey, 'key']}
                      rules={[
                        {
                          required: true,
                          message: t('联系方式不能为空'),
                        },
                      ]}
                    >
                      <Select placeholder={t('请选择联系方式')}>
                        {contactsList.map((item, index) => (
                          <Option value={item.key} key={index}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      style={{
                        width: '170px',
                      }}
                      name={[name, 'value']}
                      fieldKey={[fieldKey, 'value']}
                      rules={[
                        {
                          required: true,
                          message: t('值不能为空'),
                        },
                      ]}
                    >
                      <Input placeholder={t('请输入值')} />
                    </Form.Item>
                    <MinusCircleOutlined
                      className='control-icon-normal'
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <PlusCircleOutlined
                  className='control-icon-normal'
                  onClick={() => add()}
                />
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    ) : null;
  },
);
export default UserForm;
