import { AppDispatch, fetchMyInfo /*getMyInfo*/ } from '@/redux/myInfoSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ColumnContainer, ModalContent } from './style';
import { Columns, Members } from '@/pages/dashboard-id';
import { ChangeEvent, useEffect, useState, useRef, KeyboardEvent } from 'react';
import { ModalRootState, closeModal, openModal, setOpenModalName } from '@/redux/modalSlice';
import { toast } from 'react-toastify';
import axiosInstance from '@/api/instance/axiosInstance';
import API from '@/api/constants';
import ModalContainer from '../modal-container';
import Card from '../card';
import LoadingSpinner from '@/components/loading-spinner';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import EditColumnModal from '../modal-edit-column';
import dateExtractor from '@/utils/dateExtractor';
import TagComponent from '../tag-component';
import 'flatpickr/dist/flatpickr.min.css';

interface Props {
  columnData: Columns;
  memberData: Members[];
  viewColumns: () => void;
  dashboardId: string | undefined;
}

export interface Types {
  CardInfo: {
    cards: [
      {
        assignee: { id: number; nickname: string; profileImageUrl: string };
        columnId: number;
        createdAt: string;
        dashboardId: number;
        description: string;
        dueDate: string | null;
        id: number;
        imageUrl: string | null;
        tags: string[];
        teamId: number;
        title: string;
        updatedAt: string;
      },
    ];
    totalCount: number;
    cursorId: number;
  };
  CreateCardData: {
    asignee: string;
    title: string;
    description: string;
    dueDate: string;
    tag: string;
  };
  Tag: {
    id: number;
    name: string;
  };
}

const Column = ({ columnData, memberData, viewColumns, dashboardId }: Props) => {
  const today = new Date();
  const dispatch = useDispatch<AppDispatch>();
  // const myData = useSelector(getMyInfo);
  const [cardInfo, setCardInfo] = useState<Types['CardInfo'] | undefined>();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDropdownAsignee, setIsDropdownAsignee] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filterdMember, SetFilterdMember] = useState<Members[]>([]);
  const [userProfile, setUserProfile] = useState<string | undefined>('');
  const asigneeRef = useRef<number | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [tags, setTags] = useState<Types['Tag'][]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const colorArray = ['#ff0000', '#29c936', '#ff8c00', '#000000', '#008000', '#f122f1', '#0000ff'];
  const [createCardData, setCreateCardData] = useState<Types['CreateCardData']>({
    asignee: '',
    title: '',
    description: '',
    dueDate: '',
    tag: '',
  });

  const openModalName = useSelector((state: ModalRootState) => state.modal.openModalName);

  const handleEditColumn = () => {
    setOpenModalName(`editcolumn${columnData.id}`);
    dispatch(openModal(`editcolumn${columnData.id}`));
    viewColumns();
  };

  const handleCreateCard = () => {
    // 모달 여는 함수
    dispatch(setOpenModalName(`createcard${columnData.id}`));
    dispatch(openModal(`createcard${columnData.id}`));
  };

  const handleCloseCreateCard = () => {
    // 모달 닫는 함수
    dispatch(closeModal());
    setUploadedFile(null);
    setPreviewUrl(null);
    setUserProfile(undefined);
    setCreateCardData({ asignee: '', title: '', description: '', dueDate: '', tag: '' });
    setTags([]);
    asigneeRef.current = null;
  };

  const handleSubmitCreateCard = async () => {
    // 카드 생성 함수
    try {
      setIsLoading(true);
      if (!titleRef.current?.value || !descriptionRef.current?.value) {
        toast.error('제목,설명은 필수입니다.');
        return;
      }
      await axiosInstance.post(API.CARDS.CARDS, {
        assigneeUserId: asigneeRef.current ? asigneeRef.current : undefined,
        dashboardId: Number(dashboardId),
        columnId: columnData.id,
        title: createCardData.title,
        description: createCardData.description,
        dueDate: createCardData.dueDate ? createCardData.dueDate : undefined,
        tags: tags.map((item) => item.name),
        imageUrl: imageUrl ? imageUrl : undefined,
      });

      alert('카드생성 완료');
      setCreateCardData({ asignee: '', title: '', description: '', dueDate: '', tag: '' });
      setPreviewUrl(null);
      setUploadedFile(null);
      setUserProfile(undefined);
      setTags([]);
      dispatch(closeModal());
    } catch (err) {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      viewCards();
    }
  };

  const viewCards = async () => {
    // 카드 조회 함수
    setIsLoading(true);
    await axiosInstance
      .get(`${API.CARDS.CARDS}?size=9999&columnId=${columnData.id}`)
      .then((res) => {
        setCardInfo(res.data);
      })
      .catch(() => alert('카드 조회 실패'))
      .finally(() => setIsLoading(false));
  };

  const handleDeleteColumn = () => {
    // 컬럼 삭제 함수
    const isConfirmed = confirm('컬럼의 모든 카드가 삭제됩니다.');
    if (isConfirmed) {
      axiosInstance.delete(`${API.COLUMNS.COLUMNS}/${columnData.id}`).then(() => viewColumns());
    }
  };

  const handleUploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    // 카드 이미지 첨부 & 미리보기 출력 함수
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/') || file.type === 'image/gif') {
        alert('파일은 gif를 제외한 이미지 타입만 첨부 가능합니다.');
      } else {
        setUploadedFile(file);
        const formData = new FormData();
        formData.append('image', file as Blob);
        await axiosInstance
          .post(`${API.COLUMNS.COLUMNS}/${columnData.id}/card-image`, formData)
          .then((res) => setImageUrl(res.data.imageUrl));
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const asigneeDropdownChecker = (e: ChangeEvent<HTMLInputElement>) => {
    // 모달 드롭다운 온오프 함수
    if (e.target.value || document.activeElement === e.target) {
      setCreateCardData({ ...createCardData, asignee: e.target.value });
      setIsDropdownAsignee(true);
      setUserProfile(undefined);
    } else {
      setIsDropdownAsignee(false);
    }
  };

  const handleClickedMember = (member: Members) => {
    // 클릭된 담당자
    setCreateCardData({ ...createCardData, asignee: member.nickname });
    setIsDropdownAsignee(false);
    setUserProfile(member.profileImageUrl);
    asigneeRef.current = member.userId;
    if (inputRef.current) {
      inputRef.current.value = member.nickname;
    }
  };

  const handleCreateTag = (e: KeyboardEvent<HTMLInputElement>) => {
    // 태그 생성 함수
    if (e.key === 'Enter') {
      const input = createCardData.tag;
      const tag = {
        id: Date.now(),
        name: input,
      };
      setTags((prev) => [...prev, tag]);
      setCreateCardData({ ...createCardData, tag: '' });
    }
  };

  useEffect(() => {
    viewCards();
    dispatch(fetchMyInfo());
    if (memberData.length > 0) {
      // 멤버 목록을 받아왔을때 프로필이 null이면 기본값으로 변경
      memberData.forEach((member) => {
        member.profileImageUrl = member.profileImageUrl
          ? member.profileImageUrl
          : '/assets/image/icons/bannerLogoIconXL.svg';
      });
    }
  }, [dispatch, memberData]);

  useEffect(() => {
    // 입력값이 변할때마다 검색결과 재적용
    if (createCardData.asignee !== '') {
      const data = [...memberData];
      const filterdData = data.filter((member) => {
        return member.nickname.includes(createCardData.asignee);
      });
      SetFilterdMember(filterdData);
    } else if (createCardData.asignee === '') {
      SetFilterdMember(memberData);
    }
  }, [createCardData]);

  return (
    <ColumnContainer>
      {isLoading && <LoadingSpinner />}
      <div className='column-head'>
        <div className='column-color' />
        <h2>{columnData.title}</h2>
        <div className='inner-cards'>{cardInfo?.totalCount}</div>
        <img src='/assets/image/icons/settingIcon.svg' alt='setting-icon' onClick={handleEditColumn} />
      </div>

      <div className='column-body'>
        <button type='button' className='add-card' onClick={() => handleCreateCard()}>
          <img src='/assets/image/icons/bannerAddIcon.svg' alt='add-icon' />
        </button>
        {cardInfo && cardInfo.cards.map((card) => <Card key={card.id} card={card} />)}
      </div>

      {openModalName === `createcard${columnData.id}` ? (
        <ModalContainer
          title='할 일 생성'
          closeButtonName='취소'
          submitButtonName='생성'
          modalWidth={506}
          handleCloseModal={handleCloseCreateCard}
          handleSubmitModal={handleSubmitCreateCard}
        >
          <ModalContent $Image={previewUrl} $Text={isDropdownAsignee} $Profile={userProfile} $Tag={tags}>
            {isLoading && <LoadingSpinner />}

            <div className='first-div'>
              <h3>담당자</h3>
              <input
                className='input-box asignee-box'
                placeholder='이름을 입력해 주세요'
                type='text'
                ref={inputRef}
                onChange={(e) => asigneeDropdownChecker(e)}
                onFocus={(e) => asigneeDropdownChecker(e)}
                onBlur={() => setIsDropdownAsignee(false)}
              />
              <img src='/assets/image/icons/arrowDropDownIcon.svg' alt='dropdown-icon' className='dropdown-icon' />
              {userProfile && <img src={userProfile} className='user-image in-searchbar' />}
              <div className='input-box member-list'>
                {isDropdownAsignee &&
                  filterdMember.map((member) => (
                    <div
                      key={member.id}
                      className={`member ${asigneeRef.current === member.userId ? 'clicked' : ''}`}
                      onMouseDown={() => {
                        handleClickedMember(member);
                      }}
                    >
                      <img
                        src={
                          member.profileImageUrl ? member.profileImageUrl : '/assets/image/icons/bannerLogoIconXL.svg'
                        }
                        alt='profile-image'
                        className='user-image'
                      />
                      <span className='user-name'>{member.nickname}</span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h3>
                제목<span className='essential'> *</span>
              </h3>
              <input
                ref={titleRef}
                className='input-box'
                placeholder='제목을 입력해 주세요'
                type='text'
                value={createCardData.title}
                onChange={(e) => setCreateCardData({ ...createCardData, title: e.target.value })}
              />
            </div>
            <div>
              <h3>
                설명<span className='essential'> *</span>
              </h3>
              <textarea
                ref={descriptionRef}
                className='input-box description-box'
                placeholder='설명을 입력해 주세요'
                value={createCardData.description}
                onChange={(e) => setCreateCardData({ ...createCardData, description: e.target.value })}
              />
            </div>
            <div>
              <h3>마감일</h3>
              <Flatpickr
                className='input-box date-box'
                placeholder='날짜를 입력해 주세요'
                value={createCardData.dueDate}
                options={{
                  enableTime: true,
                  minDate: dateExtractor(today).slice(0, 10),
                  closeOnSelect: true,
                }}
                onChange={(e) => setCreateCardData({ ...createCardData, dueDate: dateExtractor(e[0]) })}
              />
            </div>
            <div>
              <h3>태그</h3>
              <input
                value={createCardData.tag}
                className='input-box tag-input'
                placeholder='입력 후 Enter'
                type='text'
                onKeyDown={(e) => handleCreateTag(e)}
                onChange={(e) => setCreateCardData({ ...createCardData, tag: e.target.value })}
              />
              <div className='input-box tag-list'>
                {tags &&
                  tags.map((tag, index) => (
                    <TagComponent
                      key={tag.id}
                      id={tag.id}
                      name={tag.name}
                      backgroundColor={colorArray[index % colorArray.length]}
                    />
                  ))}
              </div>
            </div>
            <div>
              <h3>이미지</h3>
              <div className='upload-button-box'>
                <label htmlFor='upload-button' />
                <input
                  type='file'
                  accept='image/*'
                  className='upload-button'
                  id='upload-button'
                  onChange={handleUploadFile}
                />
              </div>
              <div className='file-name'>{uploadedFile ? uploadedFile.name : '선택한 파일이 없습니다.'} </div>
            </div>
          </ModalContent>
        </ModalContainer>
      ) : null}

      {openModalName === `editcolumn${columnData.id}` && (
        <EditColumnModal
          columnId={columnData.id}
          columnName={columnData.title}
          handleEditColumn={handleEditColumn}
          handleDeleteColumn={handleDeleteColumn}
        />
      )}
    </ColumnContainer>
  );
};

export default Column;
