/**
 * Throne of Eldraine, group B — and earlier cards the doesn't-untap
 * restriction unblocked (Locked in the Cemetery, T-45 Power Armor, Watery
 * Grasp). One test per card whose behaviour is more than a stat line.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

const exiledBy = (game: Game, player: PlayerId = A): number =>
  Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === player).length;

describe("Realm-Cloaked Giant // Cast Off", () => {
  it("Cast Off destroys every non-Giant creature, then the card waits in exile", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const giant = spawn(game, "Realm-Cloaked Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Realm-Cloaked Giant");
    cast(game, card, { face: 1 });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Lovestruck Beast", () => {
  it("can't attack unless you control a 1/1 creature — itself included", () => {
    const { game } = table();
    const beast = spawn(game, "Lovestruck Beast");
    expect(whyCannotAttack(game.state, game.registry, A, beast, B)).not.toBeNull();
    spawn(game, "Grizzly Bears");
    expect(whyCannotAttack(game.state, game.registry, A, beast, B)).not.toBeNull();
    game.debugApplyEffect(
      A,
      { kind: "animate", target: 0, power: 1, toughness: 1, addTypes: [], addSubtypes: [], duration: "end-of-turn" },
      [ref(beast)],
    );
    settle(game);
    expect(whyCannotAttack(game.state, game.registry, A, beast, B)).toBeNull();
  });

  it("Heart's Desire's Human lets it attack", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const beast = spawn(game, "Lovestruck Beast");
    cast(game, toHand(game, "Lovestruck Beast"), { face: 1 });
    expect(tokensNamed(game, "Human Token", A)).toBe(1);
    expect(whyCannotAttack(game.state, game.registry, A, beast, B)).toBeNull();
  });
});

describe("Edgewall Innkeeper", () => {
  it("draws on a creature spell that has an Adventure, not on the Adventure itself", () => {
    const { game } = table();
    spawn(game, "Edgewall Innkeeper");
    lands(game, "Forest", 4);
    const adventure = toHand(game, "Lovestruck Beast");
    let before = hand(game).length;
    cast(game, adventure, { face: 1 });
    expect(hand(game).length).toBe(before - 1);
    const creature = toHand(game, "Lovestruck Beast");
    before = hand(game).length;
    cast(game, creature);
    expect(zone(game, creature)).toBe("battlefield");
    expect(hand(game).length).toBe(before);
  });
});

describe("Oko, the Trickster", () => {
  it("0: becomes a copy of a creature until end of turn, and damage to him is prevented", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, the Trickster");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, oko, 0, { atLeast: 4, targets: [ref(bears)] });
    expect(types(game, oko)).toContain("creature");
    expect(types(game, oko)).not.toContain("planeswalker");
    expect(pt(game, oko)).toEqual({ power: 2, toughness: 2 });
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(oko)]);
    settle(game);
    expect(zone(game, oko)).toBe("battlefield");
    expect(game.state.objects[oko].damageMarked).toBe(0);
    nextTurn(game);
    expect(types(game, oko)).toContain("planeswalker");
    expect(counters(game, oko, "loyalty")).toBe(4);
  });

  it("−7: the creatures you control as it resolves are 10/10 with trample; a later one isn't", () => {
    const { game } = table();
    const oko = spawn(game, "Oko, the Trickster");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    loyalty(game, oko, -7, { atLeast: 7 });
    expect(pt(game, bears)).toEqual({ power: 10, toughness: 10 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const later = spawn(game, "Grizzly Bears");
    expect(pt(game, later)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Syr Carah, the Bold", () => {
  it("her damage, and an instant's, to a player each exile the top card; damage to a creature doesn't", () => {
    const { game } = table();
    const carah = spawn(game, "Syr Carah, the Bold");
    const bears = spawn(game, "Grizzly Bears", B);
    const start = exiledBy(game);
    activate(game, carah, 0, { targets: [ref(bears)] });
    expect(exiledBy(game)).toBe(start);
    game.state.objects[carah].tapped = false;
    activate(game, carah, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(exiledBy(game)).toBe(start + 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(exiledBy(game)).toBe(start + 2);
  });
});

describe("Wildwood Tracker", () => {
  it("gets +1/+1 attacking only if you control another non-Human creature", () => {
    const { game, a } = table();
    const tracker = spawn(game, "Wildwood Tracker");
    spawn(game, "Edgewall Innkeeper");
    attack(game, a, [tracker]);
    expect(life(game, B)).toBe(19);
    spawn(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [tracker]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Mad Ratter", () => {
  it("the second card drawn this turn makes two Rats", () => {
    const { game } = table();
    spawn(game, "Mad Ratter");
    // Alice drew her first card of the turn in her draw step.
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Rat Token", A)).toBe(2);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Rat Token", A)).toBe(2);
  });
});

describe("Shambling Suit", () => {
  it("counts the artifacts and enchantments you control, itself included", () => {
    const { game } = table();
    const suit = spawn(game, "Shambling Suit");
    expect(pt(game, suit)).toEqual({ power: 1, toughness: 3 });
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    expect(pt(game, suit)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Rosethorn Halberd", () => {
  it("attaches itself to a non-Human creature as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const halberd = enter(game, "Rosethorn Halberd");
    expect(game.state.objects[halberd].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Moonlit Scavengers", () => {
  it("bounces only if you control an artifact or enchantment", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Moonlit Scavengers");
    expect(zone(game, bears)).toBe("battlefield");
    spawn(game, "Sol Ring");
    enter(game, "Moonlit Scavengers");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Locked in the Cemetery", () => {
  it("taps the creature only with five cards in your graveyard; it then stays tapped", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const first = spawn(game, "Grizzly Bears", B);
    for (let i = 0; i < 4; i++) toGraveyard(game, "Wastes");
    cast(game, toHand(game, "Locked in the Cemetery"), { targets: [ref(first)] });
    expect(game.state.objects[first].tapped).toBe(false);
    const second = spawn(game, "Grizzly Bears", B);
    toGraveyard(game, "Wastes");
    cast(game, toHand(game, "Locked in the Cemetery"), { targets: [ref(second)] });
    expect(game.state.objects[second].tapped).toBe(true);
    nextTurn(game, "upkeep");
    expect(game.state.objects[second].tapped).toBe(true);
  });
});

describe("T-45 Power Armor", () => {
  it("the equipped creature stays tapped, until an upkeep {E} untaps it and gives it a counter", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    const armor = enter(game, "T-45 Power Armor");
    expect(game.state.players[A].energy).toBe(2);
    toStep(game, "postcombat-main");
    activate(game, armor, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    game.state.objects[bears].tapped = true;
    const answers = [[0], [1]];
    a.chooseModesFn = () => answers.shift() ?? [0];
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(counters(game, bears, "trample")).toBe(1);
    expect(game.state.players[A].energy).toBe(1);
  });
});

describe("Watery Grasp", () => {
  it("waterbend {5}: the enchanted creature's owner shuffles it into their library", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const grasp = toHand(game, "Watery Grasp");
    cast(game, grasp, { targets: [ref(bears)] });
    activate(game, grasp, 0);
    expect(zone(game, bears)).toBe("library");
  });
});
