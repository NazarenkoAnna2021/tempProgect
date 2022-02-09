import React, { FC, useCallback, useEffect, useState } from "react";
import { View, ImageBackground, Text } from "react-native";
import { AuthenticationInput } from "../../components/authenticationInput";
import { PasswordInput } from "../../components/passwordInput";
import { AuthenticationButton } from "../../components/authenticationButton";
import { styles } from "./styles";
import { AuthenticationTransitionText } from "../../components/authenticationTransitionText";
import { NavigationProp } from "@react-navigation/native";
import { SignInText } from "../../components/signInText";
import { getUser } from "../../../useCases/getUser";
import { isValidEmail } from "../../../useCases/validation/isValidEmail";
import { isValidPassword } from "../../../useCases/validation/isValidPassword";
import { resetStorage } from "../../../useCases/resetStorage";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthorizationUserData } from "../../../../../src/appStorage/redux/authenticationState/authenticationStateSelector";
import { AppDispatch } from "../../../../../src/appStorage/redux/store";
import { setIsAuthorizeAction } from "../../../../../src/appStorage/redux/authenticationState/authenticationStateActions";
import { IUser } from "../../../useCases/validation/entities/IUser";
import { authorization } from "../../../useCases/authorization";

interface IProps {
    navigation: NavigationProp<{ [key: string]: unknown }>
};

export const SignInScreen: FC<IProps> = ({ navigation }) => {
    const [inputEmail, setInputEmail] = useState<string | null>(null);
    const [inputPassword, setInputPassword] = useState<string | null>(null);
    const [isEnabledButton, setIsEnabledButton] = useState<boolean>(false);
    const dispatch: AppDispatch = useDispatch();
    const userData: IUser | null = useSelector(selectAuthorizationUserData);

    useEffect(() => {
        getUser({ setInputEmail, setInputPassword });
        setIsEnabledButton(checkInputs());
    }, []);

    useEffect(() => {
        setIsEnabledButton(checkInputs());
    }, [inputEmail, inputPassword]);

    useEffect(() => {
        if (userData?.value.email && userData?.value.password) {
            setInputEmail(userData.value.email);
            setInputPassword(userData.value.password);
        };
    }, [userData]);

    const checkInputs = (): boolean => {
        return !!inputEmail && !!inputPassword && isValidEmail(inputEmail) && isValidPassword(inputPassword);
    }



    const authorizeUser = useCallback( async (): Promise<void> => {
        if (checkInputs()) {
            const userAuth = await authorization(inputEmail, inputPassword)
            dispatch(setIsAuthorizeAction(userAuth.data.status === 'ok'));
            resetStorage(inputEmail, inputPassword);
        }
    }, [inputEmail, inputPassword]);

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../../../../assets/background.jpg')} resizeMode="cover" style={styles.background} />
            <View style={styles.inputArea}>
                <SignInText margin={styles.helloText} />
                <AuthenticationInput
                    icon={require('../../../../../assets/inputUser.png')}
                    placeholderText={'Email'}
                    margin={styles.inputMargin}
                    value={inputEmail}
                    setText={setInputEmail}
                    validation={isValidEmail}
                    errorText='Email must be in format: user@email.com'
                />
                <PasswordInput
                    iconHidden={require('../../../../../assets/crossedEye.png')}
                    iconShowed={require('../../../../../assets/eye.png')}
                    placeholderText={'Password'}
                    margin={styles.inputMargin}
                    value={inputPassword}
                    setText={setInputPassword} errorText={"Password must contain  numbers, big and small letters"}                />
                <Text style={styles.forgotPassword}>Forgot the password?</Text>
            </View>
            <View style={styles.exceptArea}>
                <AuthenticationButton text="sign in" isEnabled={isEnabledButton} onPress={authorizeUser} />
                <AuthenticationTransitionText text={'Don\'t have an account? Sign up'} onPress={() => navigation.navigate('SignUn')} />
            </View>
        </View>
    );
}