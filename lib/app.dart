import 'package:flutter/material.dart';
import 'pages/login_page.dart';
import 'pages/register_page.dart';
import 'pages/home_page.dart';
import 'pages/my_farm_page.dart';
import 'pages/weather_page.dart';
import 'pages/weather_warnings_page.dart';
import 'pages/faqs_page.dart';
import 'pages/account_page.dart';
import 'pages/crop_suggestions_page.dart';
import 'utils/theme.dart';

class CropWiseApp extends StatelessWidget {
  const CropWiseApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CropWise',
      debugShowCheckedModeBanner: false,
      theme: appTheme,
      home: const LoginPage(),
      routes: {
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/home': (context) => const HomePage(),
        '/my_farm': (context) => const MyFarmPage(),
        '/weather': (context) => const WeatherPage(),
        '/weather_warnings': (context) => const WeatherWarningsPage(),
        '/faqs': (context) => const FAQsPage(),
        '/account': (context) => const AccountPage(),
        '/crop_suggestions': (context) => const CropSuggestionsPage(),
      },
    );
  }
}