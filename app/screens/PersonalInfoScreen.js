import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native'; 

const PersonalInfoScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessTrend, setFitnessTrend] = useState('');
  const [fitnessTrendStep5, setFitnessTrendStep5] = useState('');
  const [birthday, setBirthday] = useState('');

  const handleNextStep = () => {
    if (step === 1 && name) {
      setStep(2);
    } else if (step === 2 && nickname) {
      setStep(3);
    } else if (step === 3 && gender) {
      setStep(4);
    } else if (step === 4 && fitnessTrend) {
      setStep(5);
    } else if (step === 5 && fitnessTrendStep5) {
      setStep(6);
    } else if (step === 6 && birthday) {
      navigation.replace('MainTabs');
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>1. Sở thích của bạn là:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập Sở thích của bạn"
              value={name}
              onChangeText={setName}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>2. Lối sống của bạn:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lối sống của bạn"
              value={nickname}
              onChangeText={setNickname}
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>3. Ngân sách:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ngân sách"
              value={gender}
              onChangeText={setGender}
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>4. Giới tính của bạn:</Text>
            <TextInput
              style={styles.input}
              placeholder="Giới tính"
              value={fitnessTrend}
              onChangeText={setFitnessTrend}
            />
          </View>
        );
      case 5:
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>5. Yêu cầu về bạn cùng phòng:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập yêu cầu về bạn cùng phòng"
              value={fitnessTrendStep5}
              onChangeText={setFitnessTrendStep5}
            />
          </View>
        );
      case 6:
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.title}>6. Bạn sinh ngày</Text>
            <Calendar
              current={birthday}
              onDayPress={(day) => setBirthday(day.dateString)}
              markedDates={{
                [birthday]: { selected: true, selectedColor: '#00adf5', selectedTextColor: 'white' },
              }}
              markingType={'simple'}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Thanh tiến độ */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={{
              ...styles.progress,
              width: `${(step / 6) * 100}%`,
            }}
          />
        </View>
        <Text style={styles.progressText}>Đã hoàn thành {step}/6 bước</Text>
      </View>

      {/* Phần nhập liệu */}
      <View style={styles.inputSection}>
        {renderStep()}
      </View>

      {/* Các nút */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handlePreviousStep} style={styles.cancelButton}>
          <AntDesign name="arrowleft" size={20} color="white" />
          <Text style={styles.cancelButtonText}>Hoàn tác</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNextStep} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>
            {step === 6 ? 'Hoàn thành' : 'Tiếp tục'}
          </Text>
          <AntDesign name="arrowright" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    paddingHorizontal: 30,
    paddingTop: 30,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingLeft: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    padding: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  inputSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default PersonalInfoScreen;
