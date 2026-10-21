/**
 * Throne of Eldraine, group E, plus the "doesn't untap" Auras it unblocked:
 * one focused test per card whose behaviour is more than a stat line or a
 * copy of an already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("ELD batch 1E", () => {
  it("Feasting Troll King: three Foods only if cast from the hand", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Feasting Troll King"));
    expect(tokensNamed(game, "Food Token", A)).toBe(3);

    const other = table();
    enter(other.game, "Feasting Troll King");
    expect(tokensNamed(other.game, "Food Token", A)).toBe(0);
  });

  it("Feasting Troll King: sacrifice three Foods to return it from the graveyard, only during your turn", () => {
    const { game } = table();
    const troll = toGraveyard(game, "Feasting Troll King");
    for (let i = 0; i < 3; i++) spawn(game, "Food Token");
    activate(game, troll, 0);
    expect(zone(game, troll)).toBe("battlefield");
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("Ferocity of the Wilds: attacking non-Humans get +1/+0; a Human doesn't", () => {
    const { game, a } = table();
    spawn(game, "Ferocity of the Wilds");
    const bears = spawn(game, "Grizzly Bears");
    const vanguard = spawn(game, "Elite Vanguard");
    attack(game, a, [bears, vanguard]);
    expect(life(game, B)).toBe(20 - 3 - 2);
  });

  it("Doom Foretold: a player with nothing to sacrifice suffers the whole consequence", () => {
    const { game } = table();
    const doom = spawn(game, "Doom Foretold");
    const aliceHand = hand(game, A).length;
    nextTurn(game, "draw");
    expect(graveyard(game, B).length).toBe(1);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    expect(hand(game, A).length).toBe(aliceHand + 1);
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
    expect(zone(game, doom)).toBe("graveyard");
  });

  it("Doom Foretold: a player who can sacrifice does, and nothing else happens", () => {
    const { game } = table();
    const doom = spawn(game, "Doom Foretold");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Knight Token", A)).toBe(0);
    expect(zone(game, doom)).toBe("battlefield");
  });

  it("Mistford River Turtle: only another attacking non-Human is a legal target", () => {
    const { game, a } = table();
    const turtle = spawn(game, "Mistford River Turtle");
    const bears = spawn(game, "Grizzly Bears");
    const bears2 = spawn(game, "Grizzly Bears");
    const vanguard = spawn(game, "Elite Vanguard");
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [turtle, bears, bears2, vanguard]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(bears2);
    expect(seen.offered[0]).not.toContain(vanguard);
    expect(seen.offered[0]).not.toContain(turtle);
  });

  it("Bring to Life: a noncreature artifact becomes a 0/0 artifact creature with four +1/+1 counters", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone");
    lands(game, "Island", 3);
    const faerie = toHand(game, "Animating Faerie");
    cast(game, faerie, { face: 1, targets: [ref(stone)] });
    expect(types(game, stone)).toContain("creature");
    expect(pt(game, stone)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, faerie)).toBe("exile");
  });

  it("Shining Armor: attaches to a Knight as it enters", () => {
    const { game, a } = table();
    const knight = spawn(game, "Silver Knight");
    lands(game, "Plains", 2);
    pickTargets(a, knight);
    const armor = toHand(game, "Shining Armor");
    cast(game, armor);
    expect(game.state.objects[armor].attachedTo).toBe(knight);
    expect(pt(game, knight)).toEqual({ power: 2, toughness: 4 });
  });

  it("Mantle of Tides: drawing a second card attaches it", () => {
    const { game, a } = table();
    const mantle = spawn(game, "Mantle of Tides");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "Divination"));
    expect(game.state.objects[mantle].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
  });

  it("Redcap Raiders: tapping a non-Human gives +1/+1", () => {
    const { game, a } = table();
    const raiders = spawn(game, "Redcap Raiders");
    const bears = spawn(game, "Grizzly Bears");
    const vanguard = spawn(game, "Elite Vanguard");
    const seen = pickPermanents(a, bears);
    attack(game, a, [raiders]);
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(vanguard);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(life(game, B)).toBe(16);
  });

  it("Garenbrig Squire: a creature spell with an Adventure pumps it; the Adventure spell doesn't", () => {
    const { game } = table();
    const squire = spawn(game, "Garenbrig Squire");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Shepherd of the Flock"));
    expect(pt(game, squire)).toEqual({ power: 3, toughness: 3 });

    const other = table();
    const squire2 = spawn(other.game, "Garenbrig Squire");
    const [plains] = lands(other.game, "Plains", 2);
    cast(other.game, toHand(other.game, "Shepherd of the Flock"), { face: 1, targets: [ref(plains)] });
    expect(pt(other.game, squire2)).toEqual({ power: 2, toughness: 2 });
  });

  it("Giant's Skewer: equipped creature dealing combat damage to a creature makes a Food", () => {
    const { game, a, b } = table();
    const skewer = spawn(game, "Giant's Skewer");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    activate(game, skewer, 0, { targets: [ref(bears)] });
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, blocker)).toBe("graveyard");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(life(game, B)).toBe(20);
  });

  it("Bitter Chill: taps the creature, and paying {1} as it dies scries 1 and draws", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    const chill = toHand(game, "Bitter Chill");
    cast(game, chill, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    const before = hand(game, A).length;
    pickModes(a, 0);
    destroy(game, chill);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Dramatic Accusation: {U}{U} shuffles the enchanted creature into its owner's library", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    const accusation = toHand(game, "Dramatic Accusation");
    cast(game, accusation, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    activate(game, accusation, 0);
    expect(zone(game, bears)).toBe("library");
  });

  it("So Shiny: taps only if you control a token", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "So Shiny"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);

    const other = table();
    const bears2 = spawn(other.game, "Grizzly Bears", B);
    other.game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 }, []);
    lands(other.game, "Island", 3);
    cast(other.game, toHand(other.game, "So Shiny"), { targets: [ref(bears2)] });
    expect(other.game.state.objects[bears2].tapped).toBe(true);
  });
});
