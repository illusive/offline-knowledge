// Shared UI primitives. Colours and radii come from the tokens in global.css / tailwind.config.js.
// Text uses the system font and scales with Dynamic Type (allowFontScaling is on by default).

import type { ReactNode } from 'react';
import { Pressable, Text, TextInput, View, type TextProps } from 'react-native';

type Variant = 'title' | 'heading' | 'body' | 'secondary' | 'caption';

const VARIANT_CLASSES: Record<Variant, string> = {
  title: 'text-2xl font-semibold text-text',
  heading: 'text-lg font-semibold text-text',
  body: 'text-base text-text',
  secondary: 'text-base text-muted',
  caption: 'text-sm text-muted',
};

export function AppText({ variant = 'body', className = '', ...props }: TextProps & { variant?: Variant; className?: string }) {
  return <Text className={`${VARIANT_CLASSES[variant]} ${className}`} {...props} />;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-card border border-border bg-surface p-4 ${className}`}>{children}</View>;
}

// A note quoted from the source, in the source's language.
export function SourceNote({ text, lang, label }: { text: string; lang: string; label: string | null }) {
  return (
    <View className="rounded-card bg-note-bg px-3 py-2">
      {label ? <Text className="text-xs font-semibold uppercase text-note-text">{label}</Text> : null}
      <Text className="text-base text-note-text" accessibilityLanguage={lang}>
        {text}
      </Text>
    </View>
  );
}

export function SearchField(props: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  label: string;
  clearLabel: string;
}) {
  return (
    <View className="flex-row items-center rounded-card border border-border bg-surface px-3">
      <TextInput
        className="min-h-12 flex-1 py-3 text-base text-text"
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderClassName="text-muted"
        accessibilityLabel={props.label}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
        returnKeyType="search"
      />
      {props.value !== '' ? (
        <Pressable
          onPress={() => props.onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel={props.clearLabel}
          hitSlop={12}
          className="py-2 pl-3"
        >
          <Text className="text-base text-accent">×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MessageState({ title, body }: { title: string; body?: string }) {
  return (
    <View className="items-center px-6 py-12" accessibilityRole="summary">
      <AppText variant="heading" className="text-center">{title}</AppText>
      {body ? <AppText variant="secondary" className="mt-2 text-center">{body}</AppText> : null}
    </View>
  );
}
