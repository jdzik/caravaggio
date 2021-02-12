require 'caravaggio/canvas'

module Caravaggio
  class CanvasController < Caravaggio::ApplicationController
    protect_from_forgery with: :exception
    
    def index
      @canvas = Canvas.new
      @models = @canvas.models
      @associations = @canvas.associations
    end
  end
end
