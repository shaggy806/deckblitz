/**
 * Recheck list R1, group A (batch B235): cards left blocked on a key since
 * built, or never really triaged ("meta only"). One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("recheck R1 group A", () => {
  it("Accumulate Wisdom: one card, or all three with three Lessons in the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const card = toHand(game, "Accumulate Wisdom");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before); // -1 cast, +1 card

    for (let i = 0; i < 3; i++) toGraveyard(game, "Environmental Sciences");
    const again = toHand(game, "Accumulate Wisdom");
    const before2 = hand(game).length;
    cast(game, again);
    expect(hand(game).length).toBe(before2 + 2); // -1 cast, +3 cards
  });

  it("Flow State: two cards with an instant and a sorcery in the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 4);
    toGraveyard(game, "Opt");
    const card = toHand(game, "Flow State");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before); // only an instant: one card

    toGraveyard(game, "Divination");
    const again = toHand(game, "Flow State");
    const before2 = hand(game).length;
    cast(game, again);
    expect(hand(game).length).toBe(before2 + 1); // -1 cast, +2 cards
  });

  it("Dark Petition: spell mastery adds {B}{B}{B} after the search", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    const card = toHand(game, "Dark Petition");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before);
    expect(game.state.players[A].manaPool.length).toBe(3);
  });

  it("Clash of the Eikons: removing then putting a lore counter on one Saga fires its chapter again", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const saga = spawn(game, "Leaves from the Vine");
    settle(game); // its entry's chapter I
    toStep(game, "postcombat-main");
    expect(counters(game, saga, "lore")).toBe(1);
    const food = tokensNamed(game, "Food Token", A);
    const card = toHand(game, "Clash of the Eikons");
    cast(game, card, { modes: [1, 2], targets: [ref(saga), ref(saga)] });
    expect(counters(game, saga, "lore")).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(food + 1); // chapter I again
  });

  it("Volcanic Vision: damage equal to the returned card's mana value to each creature opponents control", () => {
    const { game, a } = table();
    lands(game, "Mountain", 7);
    const divination = toGraveyard(game, "Divination");
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const nighthawk = spawn(game, "Vampire Nighthawk", B);
    const card = toHand(game, "Volcanic Vision");
    pickTargets(a, divination);
    cast(game, card, { targets: [ref(divination)] });
    expect(zone(game, divination)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, nighthawk)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, card)).toBe("exile");
  });

  it("Aether Vial: offers only creature cards with mana value equal to its charge counters", () => {
    const { game, a } = table();
    const vial = spawn(game, "Aether Vial");
    game.state.objects[vial].counters.charge = 2;
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Llanowar Elves");
    const seen = pickFromZone(a, bears);
    activate(game, vial, 0);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Aether Vial: gone before its ability resolves, it uses its last-known charge counters", () => {
    const { game, a } = table();
    const vial = spawn(game, "Aether Vial");
    game.state.objects[vial].counters.charge = 2;
    const bears = toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    activate(game, vial, 0, { settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(vial)]);
    settle(game);
    expect(zone(game, vial)).toBe("graveyard");
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Smothering Abomination: sacrificing itself to its upkeep trigger still draws", () => {
    const { game } = table();
    const abomination = spawn(game, "Smothering Abomination");
    nextTurn(game);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(zone(game, abomination)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("Gyome: Food for each nontoken creature that entered this turn, itself and ones since gone included", () => {
    const { game } = table();
    enter(game, "Gyome, Master Chef");
    enter(game, "Grizzly Bears");
    const gone = enter(game, "Grizzly Bears");
    destroy(game, gone);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
  });

  it("Preston: a creature put onto the battlefield is copied as a 0/1 white Illusion; a cast one isn't", () => {
    const { game } = table();
    spawn(game, "Preston, the Vanisher");
    enter(game, "Grizzly Bears");
    const copies = named(game, "Grizzly Bears").filter((id) => game.state.objects[id].isToken);
    expect(copies.length).toBe(1);
    const c = computeCharacteristics(game.state, registryOf(game), copies[0]);
    expect(pt(game, copies[0])).toEqual({ power: 0, toughness: 1 });
    expect([...c.colors]).toEqual(["W"]);
    expect([...c.subtypes]).toEqual(["Illusion"]);

    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
  });

  it("March of Progress overloaded copies each artifact creature you control", () => {
    const { game } = table();
    lands(game, "Island", 7);
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    spawn(game, "Memnite");
    spawn(game, "Grizzly Bears");
    spawn(game, "Ornithopter", B);
    cast(game, toHand(game, "March of Progress"), { overload: true });
    expect(tokensNamed(game, "Ornithopter", A)).toBe(2);
    expect(tokensNamed(game, "Memnite", A)).toBe(1);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
    expect(tokensNamed(game, "Ornithopter", B)).toBe(0);
  });

  it("Mavren Fein: one token however many nontoken Vampires attack", () => {
    const { game, a } = table();
    const mavren = spawn(game, "Mavren Fein, Dusk Apostle");
    const nighthawk = spawn(game, "Vampire Nighthawk");
    attack(game, a, [mavren, nighthawk]);
    expect(tokensNamed(game, "Lifelink Vampire Token", A)).toBe(1);
  });

  it("Cryptolith Fragment: its mana costs each player 1 life; it transforms only if each player has 10 or less", () => {
    const { game } = table();
    const fragment = spawn(game, "Cryptolith Fragment");
    expect(game.state.objects[fragment].tapped).toBe(true); // enters tapped
    game.state.objects[fragment].tapped = false;
    activate(game, fragment, 0);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);

    game.state.players[A].life = 10;
    game.state.players[B].life = 11;
    nextTurn(game);
    toStep(game, "draw");
    expect(game.state.objects[fragment].face ?? 0).toBe(0);

    game.state.players[B].life = 10;
    nextTurn(game);
    toStep(game, "draw");
    expect(game.state.objects[fragment].face).toBe(1);
  });

  it("Finality: two counters on a chosen creature you control, then -4/-4 to all", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const bellower = spawn(game, "Woodland Bellower");
    const nighthawk = spawn(game, "Vampire Nighthawk", B);
    pickPermanents(a, bellower);
    cast(game, toHand(game, "Find // Finality"), { face: 2 });
    expect(counters(game, bellower)).toBe(2);
    expect(pt(game, bellower)).toEqual({ power: 4, toughness: 3 });
    expect(zone(game, nighthawk)).toBe("graveyard");
  });

  it("Planar Engineering: sacrifices two lands and puts four basics onto the battlefield tapped", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    pickFromZone(a, ...game.state.zones.perPlayer[A].library.slice(0, 4));
    cast(game, toHand(game, "Planar Engineering"));
    const wastes = named(game, "Wastes", A);
    expect(wastes.length).toBe(4);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(named(game, "Forest", A).length).toBe(2);
    expect(graveyard(game).length).toBe(3); // two Forests and the spell
  });
});
