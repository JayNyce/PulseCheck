
<<<<<<< HEAD
//
=======

>>>>>>> 77f930577d6f878e48ed4d2165670eacb47ec513
const sendMailMock = jest.fn();

export default {
  createTransport: jest.fn().mockReturnValue({
    sendMail: sendMailMock,
  }),
};

export { sendMailMock };
