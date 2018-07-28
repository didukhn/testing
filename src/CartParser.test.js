import CartParser from './CartParser';
import CartExpectedJSON from './cart-expected';

let parser;

beforeEach(() => {
    parser = new CartParser();
    console.error = () => { };
});

describe("CartParser - unit tests", () => {
    it('should return correct total price', () => {
        expect(parser.calcTotal([
            { name: 'Product1', price: 20, quantity: 1 },
            { name: 'Product2', price: 10, quantity: 2 },
        ])
        ).toEqual(40);
    });

    it('should return an object with keys from CSV with columns and values', () => {
        //Arrange
        let strToParse = 'car, 24, 10';

        //Act
        let result = parser.parseLine(strToParse);

        //Assert
        expect(result.name).toEqual('car');
        expect(result.price).toEqual(24);
        expect(result.quantity).toEqual(10);
    });

    it('should return an array of validation errors when columns order is incorrect', () => {
        //Arrange
        let notValidHeader = `Product name, Quantity,Price
        Mollis consequat, 9.00, 2
        Tvoluptatem, 10.32, 1
        Scelerisque lacinia, 18.90, 1
        Consectetur adipiscing, 28.72, 10
        Condimentum aliquet, 13.90, 1`;

        //Act
        let notValidHeaderResult = parser.validate(notValidHeader);

        //Assert
        expect(notValidHeaderResult).toHaveLength(2);
        expect(notValidHeaderResult[0].type).toEqual('header');
        expect(notValidHeaderResult[1].type).toEqual('header');

    });

    it('should throw error if valided return erorrs', () => {
        //Arrange
        parser.validate = jest.fn(content => ['mockError1', 'mockError2']);
        parser.readFile = jest.fn(path => 'mock');
        let mockPath = '/mock/path';

        //Act + Assert
        expect(() => parser.parse(mockPath)).toThrow('Validation failed!');

        expect(parser.validate).toHaveBeenCalledTimes(1);
    });

    it('should return an array of validation errors when it lacks required columns', () => {
        //Arrange
        let invalidHeader = `Product name,Price
            Mollis consequat,9.00,2
            Tvoluptatem,10.32,1
            Scelerisque lacinia,18.90,1
            Consectetur adipiscing,28.72,10
            Condimentum aliquet,13.90,1`;

        //Act
        let emptyStringResult = parser.validate(invalidHeader);

        //Assert
        expect(emptyStringResult).toHaveLength(1);
    });

    it('should return an array of validation errors when row of headers is empty', () => {
        //Arrange
        let emptyHeader = `
            Mollis consequat,9.00,2
            Tvoluptatem,10.32,1`;

        //Act
        let emptyStringResult = parser.validate(emptyHeader);

        //Assert
        expect(emptyStringResult).toHaveLength(3);
        expect(emptyStringResult[0].type).toEqual('header');
        expect(emptyStringResult[1].type).toEqual('header');
        expect(emptyStringResult[2].type).toEqual('header');
    });

    it('should return an array of validation errors when the body line has incorrect length', () => {
        //Arrange
        let notValideBodyLineLenght = `Product name, Price, Quantity
        Mollis consequat, 9.00, 2
        Tvoluptatem, 10.32
        Scelerisque lacinia, 18.90, 1
        Consectetur adipiscing,28.72,10
        Condimentum aliquet, 13.90, 1`;

        //Act
        let notValidBodyResult = parser.validate(notValideBodyLineLenght);

        //Assert error
        expect(notValidBodyResult).toHaveLength(1);
        expect(notValidBodyResult[0].type).toEqual('row');
        expect(notValidBodyResult[0].row).toEqual(2);
        expect(notValidBodyResult[0].column).toEqual(-1);
    });

    it('should return an array of validation errors when product quantity(price) is negative ', () => {
        //Arrange
        let negativeNumber = `Product name, Price, Quantity
        Mollis consequat, 9.00, -2
        Tvoluptatem, 10.32, 1
        Scelerisque lacinia, 18.90, 1
        Consectetur adipiscing, 28.72, 10
        Condimentum aliquet, 13.90, 1`;

        let expectedMsgWhenNegativNumber = 'Expected cell to be a positive number but received \"-2\".';

        //Act
        let postiveNumberResult = parser.validate(negativeNumber);

        //Assert
        expect(postiveNumberResult).toHaveLength(1);
        expect(postiveNumberResult[0].type).toEqual('cell');
        expect(postiveNumberResult[0].column).toEqual(2);
        expect(postiveNumberResult[0].row).toEqual(1);
    });

    it('should return an array of validation errors when product quantity(price) is invalid number ', () => {
        //Arrange
        let negativeNumber = `Product name, Price, Quantity
        Mollis consequat, 9.00a, 2`;

        //Act
        let postiveNumberResult = parser.validate(negativeNumber);

        //Assert
        expect(postiveNumberResult).toHaveLength(1);
        expect(postiveNumberResult[0].type).toEqual('cell');
        expect(postiveNumberResult[0].column).toEqual(1);
    });

    it('should return empty array of validation errors if validation is successful', () => {
        //Arrange
        let valideContent = `Product name, Price, Quantity
        Mollis consequat, 9.00, 2
        Tvoluptatem, 10.32, 1
        Scelerisque lacinia, 18.90, 1
        Consectetur adipiscing, 28.72, 10
        Condimentum aliquet, 13.90, 1`;

        //Act
        let result = parser.validate(valideContent);

        //Assert
        expect(result).toEqual([]);
    });
});


describe("CartParser - integration tests", () => {
    it('should return parsed CSV as json object', () => {
        //Arrange
        let path = __dirname + '/cart.csv';

        //Act
        let result = parser.parse(path);

        //Assert
        expect(result).toMatchObject(CartExpectedJSON);
    });

});