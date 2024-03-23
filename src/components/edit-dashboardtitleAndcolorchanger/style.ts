import styled from 'styled-components';

const EditTitleAndColorDiv = styled.div`
  width: 620px;
  height: 256px;
  flex-shrink: 0;
  border-radius: 8px;
  background: ${({ theme }) => theme.color.white};

  .dashboard-title {
    padding: 32px 522px 200px 28px;
    color: ${({ theme }) => theme.color.black_33};
    font-family: Pretendard;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
  .input-colorpicker__group {
    margin-top: 28px;
  }

  .input-colorpicker {
    position: relative;
  }

  .color-picker-box {
    margin-top: 12px;
  }
`;

export default EditTitleAndColorDiv;