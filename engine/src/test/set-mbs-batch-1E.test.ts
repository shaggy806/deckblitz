import { describe, expect, it } from "vitest";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  enter,
  lands,
  life,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const inLibrary = (game: Game, name: string, player: PlayerId = A): number =>
  game.state.zones.perPlayer[player].library.filter((id) => game.state.objects[id].cardName === name).length;

describe("MBS / SOM batch 1 group E", () => {
  it("Contested War Zone: a creature dealing combat damage to its controller hands it to that creature's controller", () => {
    const { game, a } = table();
    const zoneId = spawn(game, "Contested War Zone", B);
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears]);
    settle(game);
    expect(controller(game, zoneId)).toBe(A);
  });

  it("Piston Sledge: equips by sacrificing an artifact", () => {
    const { game } = table();
    const sledge = spawn(game, "Piston Sledge", A);
    const ring = spawn(game, "Sol Ring", A);
    const bears = spawn(game, "Grizzly Bears", A);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: sledge,
      abilityIndex: 0,
      targets: [ref(bears)],
      sacrifice: ring,
    });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
  });

  it("Nested Ghoul: damage dealt to it makes a Phyrexian Zombie", () => {
    const { game, a } = table();
    const ghoul = spawn(game, "Nested Ghoul", A);
    lands(game, "Mountain", 1);
    pickTargets(a, ghoul);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(ghoul)] });
    expect(zone(game, ghoul)).toBe("graveyard");
    expect(tokensNamed(game, "Phyrexian Zombie Token", A)).toBe(1);
  });

  it("Argent Sphinx: needs metalcraft, and returns at the next end step", () => {
    const { game } = table();
    const sphinx = spawn(game, "Argent Sphinx", A);
    lands(game, "Island", 1);
    expect(() => activate(game, sphinx)).toThrow();
    for (let i = 0; i < 3; i++) spawn(game, "Sol Ring", A);
    activate(game, sphinx);
    expect(tokensNamedOnBattlefield(game, "Argent Sphinx")).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(tokensNamedOnBattlefield(game, "Argent Sphinx")).toBe(1);
  });

  it("Glint Hawk: returns an artifact, or is sacrificed without one", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", A);
    pickPermanents(a, ring);
    const hawk = enter(game, "Glint Hawk", A);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, hawk)).toBe("battlefield");
    pickPermanents(a);
    const second = enter(game, "Glint Hawk", A);
    expect(zone(game, second)).toBe("graveyard");
  });

  it("Volition Reins: takes any permanent and untaps it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Island", 6);
    pickTargets(a, bears);
    cast(game, toHand(game, "Volition Reins"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("Livewire Lash: the equipped creature deals 2 when a spell targets it", () => {
    const { game, a } = table();
    const lash = spawn(game, "Livewire Lash", A);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Wastes", 2);
    activate(game, lash, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    lands(game, "Forest", 1);
    const seen = watchTargets(a, () => [B]);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(seen.asked).toBe(1);
    expect(life(game, B)).toBe(18);
  });

  it("Red Sun's Zenith: exiles the creature it kills and shuffles itself away", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    pickTargets(a, bears);
    const before = inLibrary(game, "Red Sun's Zenith");
    cast(game, toHand(game, "Red Sun's Zenith"), { targets: [ref(bears)], x: 2 });
    expect(zone(game, bears)).toBe("exile");
    expect(inLibrary(game, "Red Sun's Zenith")).toBe(before + 1);
  });

  it("Golden Urn: gains life for each charge counter", () => {
    const { game } = table();
    const urn: ObjectId = spawn(game, "Golden Urn", A);
    game.state.objects[urn].counters.charge = 3;
    activate(game, urn);
    expect(life(game, A)).toBe(23);
  });
});

function tokensNamedOnBattlefield(game: Game, name: string): number {
  return game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name).length;
}
