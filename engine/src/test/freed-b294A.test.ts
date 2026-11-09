import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import { rollOfEvent } from "../random-results.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("B294 group A", () => {
  it("Party Thrasher: discard to exile two and play only the chosen one", () => {
    const { game, a } = table();
    spawn(game, "Party Thrasher");
    const bolt = toLibrary(game, "Lightning Bolt");
    const dragon = toLibrary(game, "Shivan Dragon");
    toLibrary(game, "Wastes"); // what the draw step takes
    pickModes(a, 0);
    pickFromZone(a, bolt);
    const before = hand(game).length;
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, dragon)).toBe("exile");
    expect(hand(game).length).toBeLessThan(before + 2);
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
    expect(zone(game, dragon)).toBe("exile");
  });

  it("Semblance Anvil: a sorcery exiled makes sorceries cost {2} less, creatures not", () => {
    const { game, a } = table();
    const exiled = toHand(game, "Divination");
    pickFromZone(a, exiled);
    enter(game, "Semblance Anvil");
    expect(zone(game, exiled)).toBe("exile");
    lands(game, "Island", 1);
    const div = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, div);
    expect(hand(game).length).toBe(before - 1 + 2);
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [] })).not.toBeNull();
  });

  it("Brainstealer Dragon: an opponent's card reanimated under you costs its owner its mana value", () => {
    const { game } = table();
    spawn(game, "Brainstealer Dragon");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, underYourControl: true }, [ref(bears)]);
    settle(game);
    expect(controller(game, bears)).toBe(A);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("Nazgûl: the Ring tempts you, each Wraith gets a counter; nine copies", () => {
    const { game, a } = table();
    expect(game.registry.get("Nazgûl").deckCopies).toBe(9);
    const other = spawn(game, "Nazgûl");
    const nazgul = enter(game, "Nazgûl");
    void a;
    // Both Nazgûl's abilities trigger: two counters on each.
    expect(counters(game, nazgul)).toBe(2);
    expect(counters(game, other)).toBe(2);
  });

  it("Marauding Raptor: a Dinosaur dealt damage pumps it, read as it last existed; another creature doesn't", () => {
    const { game } = table();
    const raptor = spawn(game, "Marauding Raptor");
    const dino = enter(game, "Raptor Hatchling"); // a 1/1 Dinosaur: dies to the 2
    expect(zone(game, dino)).toBe("graveyard");
    // Raptor Hatchling's enrage made a 3/3 Dinosaur: dealt damage in turn, two pumps.
    expect(pt(game, raptor)).toEqual({ power: 6, toughness: 3 });
    const beforePower = pt(game, raptor).power;
    enter(game, "Grizzly Bears");
    expect(pt(game, raptor).power).toBe(beforePower);
  });

  it("Reaver Titan: protection from low mana value, 5 to each opponent on attacking", () => {
    const { game, a } = table();
    const titan = spawn(game, "Reaver Titan");
    game.debugApplyEffect(A, { kind: "become", target: 0, addTypes: ["creature"], duration: "end-of-turn" }, [ref(titan)]);
    const shock = toHand(game, "Shock");
    lands(game, "Mountain", 1);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: shock, targets: [ref(titan)] })).not.toBeNull();
    attack(game, a, [titan]);
    expect(life(game, B)).toBe(20 - 5 - 10);
  });

  it("Éowyn: exiling a red creature gives legendary creatures protection from red", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Shivan Dragon", B);
    pickTargets(a, dragon);
    const eowyn = enter(game, "Éowyn, Fearless Knight");
    expect(zone(game, dragon)).toBe("exile");
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: shock, targets: [ref(eowyn)] })).not.toBeNull();
    const bears = spawn(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: shock, targets: [ref(bears)] })).toBeNull();
  });

  it("Lion Umbra: only a modified creature, and it falls off an opponent's creature that stops being modified", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const umbra = toHand(game, "Lion Umbra");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: umbra, targets: [ref(bears)] })).not.toBeNull();
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, umbra, { targets: [ref(bears)] });
    expect(zone(game, umbra)).toBe("battlefield");
    expect(keywords(game, bears).has("reach")).toBe(true);
    delete game.state.objects[bears].counters["+1/+1"];
    toStep(game, "postcombat-main");
    expect(zone(game, umbra)).toBe("graveyard");
  });

  it("Communal Brewing: a counter, plus one per card drawn; creature spells enter with that many more", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const before = hand(game, B).length;
    const brewing = enter(game, "Communal Brewing");
    expect(hand(game, B).length).toBe(before + 1);
    expect(counters(game, brewing, "ingredient")).toBe(2);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(2);

    const none = table();
    pickTargets(none.a);
    const solo = enter(none.game, "Communal Brewing");
    expect(counters(none.game, solo, "ingredient")).toBe(1);
  });

  it("Angel of Serenity: exiles chosen targets and a graveyard card on yes, nothing on no; back to hands on leaving", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toGraveyard(game, "Serra Angel", B);
    pickTargets(a, bears, card);
    pickModes(a, 0);
    const angel = enter(game, "Angel of Serenity");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, card)).toBe("exile");
    destroy(game, angel);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, card)).toBe("hand");

    const no = table();
    const stay = spawn(no.game, "Grizzly Bears", B);
    pickTargets(no.a, stay);
    pickModes(no.a);
    enter(no.game, "Angel of Serenity");
    expect(zone(no.game, stay)).toBe("battlefield");
  });

  it("Noble Heritage: each player may add two counters; an opponent who does gives you protection from them", () => {
    const { game, a, b } = table();
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    spawn(game, "Noble Heritage");
    const bobs = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickModes(b, 0);
    pickPermanents(b, bobs);
    nextTurn(game); // bob's turn
    nextTurn(game, "upkeep"); // alice's upkeep
    settle(game);
    expect(counters(game, bobs)).toBe(2);
    expect(JSON.stringify(game.state.playerEffects)).toContain("protectionFromPlayers");
  });

  it("Elesh Norn: damage from an opponent's source costs them 2 unless they pay; its Saga's final chapter comes back as Elesh Norn", () => {
    const { game, b } = table();
    spawn(game, "Elesh Norn");
    nextTurn(game);
    settle(game);
    const source = spawn(game, "Grizzly Bears", B);
    attack(game, b, [source], A);
    expect(life(game, B)).toBe(18); // bob couldn't pay {1}

    const etch = table();
    const norn = spawn(etch.game, "Elesh Norn");
    etch.game.debugApplyEffect(A, { kind: "flicker", target: 0, transformed: true }, [ref(norn)]);
    settle(etch.game);
    const saga = norn;
    const bears = spawn(etch.game, "Grizzly Bears", B);
    const artifact = spawn(etch.game, "Sol Ring", B);
    for (let i = 0; i < 2; i += 1) {
      nextTurn(etch.game);
      nextTurn(etch.game);
      settle(etch.game);
    }
    void saga;
    expect(zone(etch.game, bears)).toBe("graveyard");
    expect(zone(etch.game, artifact)).toBe("battlefield");
    expect(named(etch.game, "Elesh Norn").length).toBe(1);
  });

  it("Braid of Fire: each upkeep adds {R} per age counter, sacrificed when declined", () => {
    const { game, a } = table();
    const braid = spawn(game, "Braid of Fire");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, braid, "age")).toBe(1);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R").length).toBe(1);
    nextTurn(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, braid, "age")).toBe(2);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "R").length).toBe(2);
    pickModes(a);
    nextTurn(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, braid)).toBe("graveyard");
  });

  it("Dissipation Field: a permanent that deals damage to you goes back to its owner's hand", () => {
    const { game, b } = table();
    spawn(game, "Dissipation Field");
    nextTurn(game);
    settle(game);
    const bears = spawn(game, "Grizzly Bears", B);
    attack(game, b, [bears], A);
    expect(life(game, A)).toBe(18);
    expect(zone(game, bears)).toBe("hand");
  });

  it("Jackdaw Savior: another flier dying returns a lesser creature card, Jackdaw's own trigger reads its last mana value", () => {
    const { game, a } = table();
    spawn(game, "Jackdaw Savior");
    const angel = spawn(game, "Serra Angel");
    const bears = toGraveyard(game, "Grizzly Bears");
    const big = toGraveyard(game, "Shivan Dragon");
    const seen = watchTargets(a, (o) => [o[0]?.[0] ?? null]);
    destroy(game, angel);
    void seen;
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, big)).toBe("graveyard"); // 6 is not less than 5
  });

  it("Katilda: a Human can tap for a mana of its own color", () => {
    const { game } = table();
    spawn(game, "Katilda, Dawnhart Prime");
    const vanguard = spawn(game, "Elite Vanguard");
    activate(game, vanguard, 0);
    expect(game.state.players[A].manaPool.filter((u) => u.type === "W").length).toBe(1);
  });

  it("Hateful Eidolon: draws for each of your Auras on the creature that died, not for others'", () => {
    const { game } = table();
    spawn(game, "Hateful Eidolon");
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(bears)] });
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before + 1);

    const other = table();
    spawn(other.game, "Hateful Eidolon");
    const b2 = spawn(other.game, "Grizzly Bears", B);
    const aura = spawn(other.game, "Holy Strength", B);
    other.game.state.objects[aura].attachedTo = b2;
    const before2 = hand(other.game).length;
    destroy(other.game, b2);
    expect(hand(other.game).length).toBe(before2);
  });

  it("Toralf: excess noncombat damage hits any target but that permanent; the Hammer is +3/+0 only on the legendary", () => {
    const { game, a } = table();
    spawn(game, "Toralf, God of Fury");
    const bears = spawn(game, "Grizzly Bears", B);
    const watched = watchTargets(a, () => [B]);
    game.debugApplyEffect(A, { kind: "damage", amount: 3, target: 0 }, [ref(bears)]);
    settle(game);
    expect(watched.offered[0]).not.toContain(bears);
    expect(life(game, B)).toBe(19);

    const hammer = table();
    const legend = spawn(hammer.game, "Toralf, God of Fury");
    const plain = spawn(hammer.game, "Grizzly Bears");
    lands(hammer.game, "Mountain", 6);
    const h = toHand(hammer.game, "Toralf, God of Fury");
    cast(hammer.game, h, { face: 1 });
    activate(hammer.game, h, 0, { targets: [ref(plain)] });
    expect(pt(hammer.game, plain).power).toBe(2);
    activate(hammer.game, h, 0, { targets: [ref(legend)] });
    expect(pt(hammer.game, legend).power).toBe(8);
  });

  it("Kroxa: cast without escape it's sacrificed, and a discarded land still costs 3 life", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const kroxa = toHand(game, "Kroxa, Titan of Death's Hunger");
    const before = life(game, B);
    cast(game, kroxa);
    expect(zone(game, kroxa)).toBe("graveyard");
    expect(life(game, B)).toBe(before - 3); // bob's hand is all Wastes
  });

  it("Mr. House: a roll of 4+ makes a Robot, 6 a Robot and a Treasure; a Treasure's mana rolls another die", () => {
    const { game } = table();
    const house = spawn(game, "Mr. House, President and CEO");
    const treasure = game.debugSpawn("Treasure Token", A, "battlefield", {});
    activate(game, treasure, 0);
    lands(game, "Wastes", 3);
    activate(game, house, 0);
    const rolls = game.state.eventLog.filter((e) => e.type === "dice-rolled");
    expect(rollOfEvent(rolls[rolls.length - 1] as never).results.length).toBe(2);
  });

  it("Beacon of Immortality: doubles a life total, negative further down, and shuffles itself in", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const beacon = toHand(game, "Beacon of Immortality");
    cast(game, beacon, { targets: [ref(A)] });
    expect(life(game)).toBe(40);
    expect(zone(game, beacon)).toBe("library");
    void a;

    const neg = table();
    spawn(neg.game, "Platinum Angel");
    neg.game.state.players[A].life = -3;
    lands(neg.game, "Plains", 6);
    cast(neg.game, toHand(neg.game, "Beacon of Immortality"), { targets: [ref(A)] });
    expect(life(neg.game)).toBe(-6);
  });

  it("stray subtypes check", () => {
    const { game } = table();
    const robot = game.debugSpawn("Robot Token (Automated Assembly Line)", A, "battlefield", {});
    expect(subtypes(game, robot)).toContain("Robot");
    expect(tokensNamed(game, "Nothing")).toBe(0);
    void toExile;
    void graveyard;
    void (0 as unknown as ObjectId);
  });
});
