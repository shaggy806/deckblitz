import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("playtest batch 341 K", () => {
  it("Chimney Goyf counts the card types among cards in all graveyards", () => {
    const { game } = table();
    const goyf = spawn(game, "Chimney Goyf");
    expect(pt(game, goyf)).toEqual({ power: 0, toughness: 1 });
    toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
  });

  it("Chimney Goyf's death has the target opponent put a card from hand on top", () => {
    const { game, a } = table();
    const goyf = spawn(game, "Chimney Goyf");
    pickTargets(a, B);
    const before = hand(game, B).length;
    destroy(game, goyf);
    settle(game);
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("Establishing Shot deals 3 as the first spell of the game, then 2", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Establishing Shot"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Establishing Shot"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
  });

  it("Where We're Going... puts a flying counter on a Vehicle that isn't a creature", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const copter = spawn(game, "Smuggler's Copter");
    const spell = toHand(game, "Where We're Going...");
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(copter)] });
    expect(counters(game, copter, "flying")).toBe(1);
    expect(hand(game).length).toBe(before);
  });

  it("More of That Strange Oil... counters a creature spell and scries", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "More of That Strange Oil..."), { modes: [1], targets: [ref(bears)], settle: false });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Evil Boros Charm's modes: 2 damage and 2 life, or a lifelink haste Spirit", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Evil Boros Charm"), { modes: [0], targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    cast(game, toHand(game, "Evil Boros Charm"), { modes: [2] });
    const [spirit] = named(game, "Spirit Token (Colorless, Lifelink, Haste)");
    expect(spirit).toBeDefined();
    expect(keywords(game, spirit).has("lifelink")).toBe(true);
    expect(keywords(game, spirit).has("haste")).toBe(true);
  });

  it("Khod makes every land an Island and pumps only your other sea creatures", () => {
    const { game } = table();
    const khod = spawn(game, "Khod, Etlan Shiis Envoy");
    const forest = spawn(game, "Forest", B);
    const looter = spawn(game, "Merfolk Looter");
    const theirs = spawn(game, "Merfolk Looter", B);
    expect(subtypes(game, forest)).toContain("Island");
    expect(subtypes(game, forest)).toContain("Forest");
    expect(pt(game, looter)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, khod)).toEqual({ power: 2, toughness: 3 });
  });

  it("Stormscale Wurm's storm copy becomes a token, and each pumps the other", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Stormscale Wurm"));
    const wurms = named(game, "Stormscale Wurm");
    expect(wurms).toHaveLength(2);
    expect(wurms.filter((id) => game.state.objects[id].isToken)).toHaveLength(1);
    for (const id of wurms) expect(pt(game, id)).toEqual({ power: 7, toughness: 7 });
  });

  it("Personal Decoy enters with loyalty equal to your life and is exiled if it would leave", () => {
    const { game } = table();
    game.state.players[A].life = 13;
    const decoy = enter(game, "Personal Decoy");
    expect(counters(game, decoy, "loyalty")).toBe(13);
    destroy(game, decoy);
    expect(zone(game, decoy)).toBe("exile");
  });

  it("Devoted Sultai offers only cards with mana value up to its devotion to Sultai", () => {
    // Devotion 2: Llanowar Elves' {G} and the Sultai's own.
    const { game, a } = table();
    a.chooseModesFn = () => [0]; // "you may" — yes
    spawn(game, "Llanowar Elves");
    const bears = toGraveyard(game, "Grizzly Bears");
    const wurm = toGraveyard(game, "Craw Wurm");
    const seen = watchTargets(a, (offered) => [offered[0]?.[0] ?? null]);
    enter(game, "Devoted Sultai");
    // Only the Bears could be chosen, so the target was never asked.
    expect(seen.asked).toBe(0);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, wurm)).toBe("graveyard");

    const only = table();
    only.a.chooseModesFn = () => [0];
    const lone = toGraveyard(only.game, "Craw Wurm");
    enter(only.game, "Devoted Sultai");
    expect(zone(only.game, lone)).toBe("graveyard");
  });

  it("The Crafter makes two Scraps and turns a sacrificed artifact into Bling", () => {
    const { game } = table();
    const crafter = enter(game, "The Crafter");
    expect(tokensNamed(game, "Scrap Token")).toBe(2);
    const thopter = spawn(game, "Ornithopter");
    activate(game, crafter, 0, { sacrifice: thopter });
    expect(zone(game, thopter)).toBe("graveyard");
    const [bling] = named(game, "Bling Token");
    expect(bling).toBeDefined();
    lands(game, "Wastes", 1);
    activate(game, bling, 0, { targets: [ref(crafter)] });
    expect(pt(game, crafter)).toEqual({ power: 4, toughness: 4 });
  });

  it("Kibo's Bananamobile: a sacrificed Banana deals 2 damage to an attacking creature", () => {
    const { game, a } = table();
    enter(game, "Kibo's Bananamobile");
    expect(tokensNamed(game, "Banana Token")).toBe(3);
    const bears = spawn(game, "Grizzly Bears");
    const ironworks = spawn(game, "Krark-Clan Ironworks");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    const [banana] = named(game, "Banana Token");
    pickTargets(a, bears);
    a.chooseModesFn = () => [0]; // "you may" — yes
    activate(game, ironworks, 0, { sacrifice: banana });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Banana Token")).toBe(2);
  });

  it("The Bear Force Pilot's Vehicle counts your Bears", () => {
    const { game } = table();
    enter(game, "The Bear Force Pilot");
    const [vehicle] = named(game, "0/0 Flying Bear Vehicle Token");
    expect(pt(game, vehicle)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, vehicle).has("flying")).toBe(true);
    spawn(game, "Grizzly Bears");
    expect(pt(game, vehicle)).toEqual({ power: 2, toughness: 2 });
  });

  it("The Bringer of the Red Beard: the Red Beard makes its creature red, and both bonuses apply", () => {
    const { game } = table();
    const bringer = enter(game, "The Bringer of the Red Beard");
    expect(pt(game, bringer)).toEqual({ power: 2, toughness: 1 });
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    const [beard] = named(game, "Red Beard Token");
    lands(game, "Wastes", 1);
    activate(game, beard, 0, { targets: [ref(bears)] });
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["R"]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("Emrakul and Chatterfang makes 15 Scions as it's cast and has protection from non-Squirrels", () => {
    const { game } = table();
    lands(game, "Forest", 11);
    const emrakul = toHand(game, "Emrakul and Chatterfang");
    cast(game, emrakul);
    expect(tokensNamed(game, "Eldrazi Squirrel Scion Token")).toBe(15);
    expect(zone(game, emrakul)).toBe("battlefield");
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(emrakul)] })).toThrow();
  });

  it("Penumbra Umbra saves its creature and leaves a black token copy of it", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const umbra = toHand(game, "Penumbra Umbra");
    cast(game, umbra, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, umbra)).toBe("graveyard");
    const all = named(game, "Grizzly Bears");
    expect(all).toHaveLength(2);
    const copy = all.find((id) => id !== bears)!;
    expect([...computeCharacteristics(game.state, registryOf(game), copy).colors]).toEqual(["B"]);
  });

  it("Mindslaver Toolkit: X, T for any number of the costs, and its control can be given away", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const kit = spawn(game, "Mindslaver Toolkit");
    const before = hand(game).length;
    activate(game, kit, 1, { x: 2, modes: [0, 1] });
    expect(life(game, A)).toBe(18);
    expect(hand(game).length).toBe(before - 2);

    const second = table();
    const other = spawn(second.game, "Mindslaver Toolkit");
    activate(second.game, other, 0, { targets: [ref(B)] });
    expect(controller(second.game, other)).toBe(B);
  });

  it("Nim Mongoose enters tapped and, with threshold, gets +1/+0 per artifact", () => {
    const { game } = table();
    const mongoose = enter(game, "Nim Mongoose");
    expect(game.state.objects[mongoose].tapped).toBe(true);
    spawn(game, "Ornithopter");
    expect(pt(game, mongoose)).toEqual({ power: 2, toughness: 1 });
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    expect(pt(game, mongoose)).toEqual({ power: 3, toughness: 1 });
  });
});
