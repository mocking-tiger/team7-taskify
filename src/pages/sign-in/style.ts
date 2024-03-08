import styled from 'styled-components';

const StSignInContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  h3 {
    font-size: 2rem;
    font-weight: 500;
    color: ${({ theme }) => theme.color.black_33};
    margin-top: 10px;
  }

  .container__box {
    max-width: 520px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  form {
    margin-top: 38px;
  }

  h5 {
    font-size: 1.6rem;
    font-weight: 400;
    color: ${({ theme }) => theme.color.black_33};

    a {
      text-decoration: underline;
      color: ${({ theme }) => theme.color.violet};
    }
  }
`;

export default StSignInContainer;
