require 'caravaggio/canvas'

module Caravaggio
  class CanvasController < Caravaggio::ApplicationController
    protect_from_forgery with: :exception
    
    def index
      @canvas = Canvas.new
      @models = @canvas.models
      @figures = @canvas.figures
      @associations = @canvas.associations
    end
  end
end
