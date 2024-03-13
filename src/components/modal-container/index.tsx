import { FormEvent, MouseEvent, ReactNode } from 'react';
import PortalContainer from '../portal';
import StModalContainer from './style';

interface ModalProps {
  title: string;
  closeButtonName: string;
  submitButtonName: string;
  isDeletable?: boolean;
  modalWidth?: number;
  children: ReactNode;
  handleCloseModal: (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
  handleDeleteModal?: (e: MouseEvent<HTMLButtonElement | HTMLDivElement>) => void;
  handleSubmitModal: (e: FormEvent<HTMLButtonElement>) => void;
}

/**
 * 예시는 dashboard 페이지 참고.
 * @param {string} title - 모달 대제목
 * @param {string} closeButtonName - 모달 닫는 버튼 이름
 * @param {string} submitButtonName - 모달 submit 동작 버튼 이름
 * @param {boolean} isDeletable - 삭제 버튼 유무 (false가 디폴트)
 * @param {number} modalWidth - 모달의 너비 (웹 사이즈를 적으세요)
 * @param {ReactNode} children - 모달의 컨텐트 영역
 * @param {MouseEvent} handleCloseModal - 모달 닫을 때 함수
 * @param {MouseEvent} handleSubmitModal - 모달 submit 함수
 * @returns
 */
const ModalContainer = ({
  title,
  closeButtonName,
  submitButtonName,
  modalWidth,
  isDeletable = false,
  children,
  handleCloseModal,
  handleDeleteModal,
  handleSubmitModal,
}: ModalProps) => {
  return (
    <PortalContainer>
      <StModalContainer $modalWidth={modalWidth}>
        <div className='modal-dim' onClick={handleCloseModal}></div>
        <div className='modal-content'>
          <h2>{title}</h2>
          {children}
          <div className='modal-button-group'>
            <div className='delete-button-box'>
              {isDeletable ? (
                <button type='button' onClick={handleDeleteModal}>
                  삭제하기
                </button>
              ) : null}
            </div>
            <div className='submit-button-box'>
              <button className='modal-button__close' type='button' onClick={handleCloseModal}>
                {closeButtonName}
              </button>
              <button className='modal-button__submit' type='submit' onClick={handleSubmitModal}>
                {submitButtonName}
              </button>
            </div>
          </div>
        </div>
      </StModalContainer>
    </PortalContainer>
  );
};

export default ModalContainer;
