import 'package:flutter/material.dart';

class CropWiseAppBar extends StatelessWidget implements PreferredSizeWidget {
  final bool isLoggedIn;
  final String currentPage;

  const CropWiseAppBar({
    Key? key,
    this.isLoggedIn = true,
    required this.currentPage,
  }) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      title: Row(
        children: [
          Image.network(
            'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cropwiselogo.JPG-fUfAvH60Z6dvkIh3apnI79000zXL8U.jpeg',
            width: 120,
            height: 40,
            fit: BoxFit.contain,
          ),
        ],
      ),
      actions: [
        _buildNavButton(context, 'Home', '/home'),
        _buildNavButton(context, 'My Farm', '/my_farm'),
        _buildNavButton(context, 'Weather', '/weather'),
        _buildNavButton(context, 'FAQs', '/faqs'),
        const SizedBox(width: 16),
        isLoggedIn
            ? ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/account');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6ABF69),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                ),
                child: const Text('Account'),
              )
            : ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/login');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF6ABF69),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                ),
                child: const Text('Login'),
              ),
        const SizedBox(width: 16),
      ],
    );
  }

  Widget _buildNavButton(BuildContext context, String title, String route) {
    final isActive = currentPage == title;
    return TextButton(
      onPressed: () {
        if (!isActive) {
          Navigator.pushReplacementNamed(context, route);
        }
      },
      style: TextButton.styleFrom(
        foregroundColor: isActive ? const Color(0xFF6ABF69) : Colors.black,
        padding: const EdgeInsets.symmetric(horizontal: 16),
      ),
      child: Text(
        title,
        style: TextStyle(
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          fontSize: 16,
        ),
      ),
    );
  }
}