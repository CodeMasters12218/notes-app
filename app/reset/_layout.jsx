import { Stack } from 'expo-router';

const ResetLayout = () => {  
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    ); 
};    

export default ResetLayout;
