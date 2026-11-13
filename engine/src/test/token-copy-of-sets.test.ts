import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  keywords,
  lands,
  loyalty,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

// create-token-copy's `of` widened (rule 707.2): a permanent a cost took,
// copied as it last existed (rule 608.2h — Cleaver Skaab); each card in a
// graveyard matching a filter (Grist, the Plague Swarm's −6); and copies
// created attached to a creature (Arna Kennerüd, Skycaptain).

const attachTo = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(attachment)]);
  settle(game);
};
const tokenCopies = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken === true && game.state.objects[id].cardName === name);
const colors = (game: Game, id: ObjectId): readonly string[] => [...computeCharacteristics(game.state, game.registry, id).colors];

describe("Cleaver Skaab — copies of the sacrificed creature", () => {
  it("creates two copies of the sacrificed Zombie", () => {
    const { game } = table();
    const skaab = spawn(game, "Cleaver Skaab");
    const corpse = spawn(game, "Walking Corpse");
    lands(game, "Island", 3);
    activate(game, skaab, 0, { sacrifice: corpse });
    expect(tokensNamed(game, "Walking Corpse", A)).toBe(2);
  });

  it("a sacrificed token is copied as it last existed (rule 608.2h)", () => {
    const { game } = table();
    const skaab = spawn(game, "Cleaver Skaab");
    game.debugApplyEffect(A, { kind: "create-token", token: "Zombie Token", count: 1, separate: true });
    settle(game);
    const zombie = tokenCopies(game, "Zombie Token")[0]!;
    lands(game, "Island", 3);
    activate(game, skaab, 0, { sacrifice: zombie });
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
  });

  it("a sacrificed Clone's copies copy what it copied, not the Clone card", () => {
    const { game, a } = table();
    const skaab = spawn(game, "Cleaver Skaab");
    const corpse = spawn(game, "Walking Corpse");
    a.chooseCopyFn = () => corpse;
    lands(game, "Island", 7);
    cast(game, toHand(game, "Clone"));
    const clone = game.battlefield.find((id) => game.state.objects[id].cardName === "Clone")!;
    expect(game.state.objects[clone].copyOf).toBe("Walking Corpse");
    activate(game, skaab, 0, { sacrifice: clone });
    expect(tokensNamed(game, "Walking Corpse", A)).toBe(2);
    expect(tokensNamed(game, "Clone", A)).toBe(0);
  });
});

describe("Grist, the Plague Swarm", () => {
  it("−6: a 1/1 black and green Insect copy of each creature card in your graveyard", () => {
    const { game } = table();
    const grist = spawn(game, "Grist, the Plague Swarm");
    toGraveyard(game, "Craw Wurm");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Walking Corpse", B);
    loyalty(game, grist, -6, { atLeast: 6 });
    const wurm = tokenCopies(game, "Craw Wurm");
    expect(wurm).toHaveLength(1);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(tokensNamed(game, "Walking Corpse")).toBe(0);
    expect(pt(game, wurm[0]!)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, wurm[0]!)).toEqual(["Insect"]);
    expect([...colors(game, wurm[0]!)].sort()).toEqual(["B", "G"]);
  });

  it("+1: an Insect, then mill two; a deathtouch counter on it if a black card was milled", () => {
    const { game } = table();
    const grist = spawn(game, "Grist, the Plague Swarm");
    toLibrary(game, "Vampire Nighthawk");
    loyalty(game, grist, 1);
    const insect = game.battlefield.find((id) => game.state.objects[id].cardName === "Insect Token (Black-Green)")!;
    expect(counters(game, insect, "deathtouch")).toBe(1);
    expect(keywords(game, insect).has("deathtouch")).toBe(true);
  });

  it("+1 with no black card milled: no counter", () => {
    const { game } = table();
    const grist = spawn(game, "Grist, the Plague Swarm");
    loyalty(game, grist, 1);
    const insect = game.battlefield.find((id) => game.state.objects[id].cardName === "Insect Token (Black-Green)")!;
    expect(counters(game, insect, "deathtouch")).toBe(0);
  });

  it("Voracious Larva: a creature returned from your graveyard lets you pay {G} to transform it", () => {
    const { game, a } = table();
    const larva = spawn(game, "Grist, Voracious Larva");
    lands(game, "Forest", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(bears)]);
    settle(game);
    expect(game.state.objects[larva].zone).toBe("battlefield");
    expect(computeCharacteristics(game.state, game.registry, larva).types).toContain("planeswalker");
    expect(counters(game, larva, "loyalty")).toBe(3);
  });

  it("Voracious Larva: a creature that entered from anywhere else doesn't trigger it", () => {
    const { game, a } = table();
    const larva = spawn(game, "Grist, Voracious Larva");
    lands(game, "Forest", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(computeCharacteristics(game.state, game.registry, larva).types).toContain("creature");
  });
});

describe("Arna Kennerüd, Skycaptain — copies created attached", () => {
  it("doubles the counters, then copies each nontoken Aura and Equipment attached to it, attached to it", () => {
    const { game, a } = table();
    spawn(game, "Arna Kennerüd, Skycaptain");
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    const aura = spawn(game, "Holy Strength");
    attachTo(game, sword, bears);
    attachTo(game, aura, bears);
    game.state.objects[bears].counters["+1/+1"] = 1;
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(2);
    const swords = tokenCopies(game, "Bonesplitter");
    const auras = tokenCopies(game, "Holy Strength");
    expect(swords).toHaveLength(1);
    expect(auras).toHaveLength(1);
    expect(game.state.objects[swords[0]!].attachedTo).toBe(bears);
    expect(game.state.objects[auras[0]!].attachedTo).toBe(bears);
    expect(game.state.objects[auras[0]!].controller).toBe(A);
  });

  it("with the creature gone, an Aura copy isn't created and an Equipment copy enters unattached", () => {
    const { game, a } = table();
    spawn(game, "Arna Kennerüd, Skycaptain");
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    const aura = spawn(game, "Holy Strength");
    attachTo(game, sword, bears);
    attachTo(game, aura, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(tokenCopies(game, "Holy Strength")).toHaveLength(0);
    const swords = tokenCopies(game, "Bonesplitter");
    expect(swords).toHaveLength(1);
    expect(game.state.objects[swords[0]!].attachedTo).toBeNull();
  });

  it("copies no token attached to it", () => {
    const { game, a } = table();
    spawn(game, "Arna Kennerüd, Skycaptain");
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    attachTo(game, sword, bears);
    attack(game, a, [bears]);
    const first = tokenCopies(game, "Bonesplitter");
    expect(first).toHaveLength(1);
    // Next combat: the token copy is attached too, but only the card is copied.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    attack(game, a, [bears]);
    expect(tokenCopies(game, "Bonesplitter")).toHaveLength(2);
  });
});
