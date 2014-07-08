# https://github.com/joeellis/remote-sass

require 'sass'
require 'net/http'
require 'time'

module Sass
  module Importers
    class HTTP < Base
      def initialize root
        @root = URI.parse root

        unless scheme_allowed? @root
          raise ArgumentError, "Absolute HTTP URIs only"
        end
      end

      def find_relative uri, base, options
        _find @root + base + uri, options
      end

      def find uri, options
        _find @root + uri, options
      end

      def mtime uri, options
        uri = URI.parse uri
        return unless scheme_allowed? uri
        Net::HTTP.start(uri.host, uri.port) do |http|
          response = http.head uri.request_uri

          if response.is_a?(Net::HTTPOK) && response['Last-Modified']
            Time.parse response['Last-Modified']
          elsif response.is_a? Net::HTTPOK
            # we must assume that it just changed
            Time.now
          else
            nil
          end
        end
      end

      def key(uri, options)
        [self.class.name, uri]
      end

      def to_s
        @root.to_s
      end

      protected

      def extensions
        {'.sass' => :sass, '.scss' => :scss}
      end

      private

      def scheme_allowed? uri
        uri.absolute? && (uri.scheme == 'http' || uri.scheme == 'https')
      end

      def exists? uri
        Net::HTTP.start(uri.host, uri.port) do |http|
          http.head(uri.request_uri).is_a? Net::HTTPOK
        end
      end

      def get_syntax uri
        # determine the syntax being used
        ext = File.extname uri.path
        syntax = extensions[ext]

        # this must not be the full path: try another
        if syntax.nil?
          ext, syntax = extensions.find do |possible_ext, possible_syntax|
            new_uri = uri.dup
            new_uri.path += possible_ext
            exists? new_uri
          end
          return if syntax.nil?
          uri.path += ext
        end
        syntax
      end

      def _find uri, options
        raise ArgumentError, "Absolute HTTP URIs only" unless scheme_allowed? uri

        syntax = get_syntax uri

        # fetch the content
        if exists? uri
          Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https') do |http|
            response = http.get uri.request_uri
            response.value

            options[:importer] = self
            options[:filename] = uri.to_s
            options[:syntax] = syntax
            Sass::Engine.new response.body, options
          end
        else
          nil
        end
      # rescue
      #   nil
      end
    end
  end
end