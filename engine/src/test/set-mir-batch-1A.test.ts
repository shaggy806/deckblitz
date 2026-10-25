import { describe, expect, it } from "vitest";
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
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Mirage batch 1A", () => {
  it("Polymorph destroys the creature and its controller reveals into a creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const dragon = toLibrary(game, "Shivan Dragon", B);
    lands(game, "Island", 4);
    pickTargets(a, bears);
    cast(game, toHand(game, "Polymorph"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, dragon)).toBe("battlefield");
    expect(game.state.objects[dragon].controller).toBe(B);
  });

  it("Carrion makes Insects equal to the sacrificed creature's power", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Carrion"), { sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Insect Token (Black, 0/1)", A)).toBe(3);
  });

  it("Illumination counters an artifact spell and its controller gains its mana value", () => {
    const { game, a } = table();
    lands(game, "Wastes", 11);
    lands(game, "Plains", 2);
    const colossus = toHand(game, "Darksteel Colossus");
    cast(game, colossus, { settle: false });
    pickTargets(a, colossus);
    cast(game, toHand(game, "Illumination"), { targets: [ref(colossus)], settle: false });
    settle(game);
    expect(zone(game, colossus)).not.toBe("battlefield");
    expect(life(game, A)).toBe(31);
  });

  it("Zirilan finds a Dragon that has haste and is exiled at the next end step", () => {
    const { game, a } = table();
    const zirilan = spawn(game, "Zirilan of the Claw");
    const dragon = toLibrary(game, "Shivan Dragon");
    lands(game, "Mountain", 3);
    pickFromZone(a, dragon);
    activate(game, zirilan);
    expect(zone(game, dragon)).toBe("battlefield");
    expect(keywords(game, dragon).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, dragon)).toBe("exile");
  });

  it("Benevolent Unicorn takes 1 off a spell's damage, not a creature's", () => {
    const { game, a } = table();
    spawn(game, "Benevolent Unicorn", B);
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    attack(game, a, [giant]);
    expect(life(game, B)).toBe(15);
  });

  it("Mtenda Griffin returns itself and a Griffin card, only during your upkeep", () => {
    const { game, a } = table();
    const griffin = spawn(game, "Mtenda Griffin");
    const other = toGraveyard(game, "Mtenda Griffin");
    lands(game, "Plains", 1);
    expect(() => activate(game, griffin, 0, { targets: [ref(other)] })).toThrow();
    toStep(game, "upkeep");
    pickTargets(a, other);
    activate(game, griffin, 0, { targets: [ref(other)] });
    expect(zone(game, griffin)).toBe("hand");
    expect(zone(game, other)).toBe("hand");
  });

  it("Lure of Prey can't be cast unless an opponent cast a creature spell this turn", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const lure = toHand(game, "Lure of Prey");
    expect(() => cast(game, lure)).toThrow();
  });

  it("Lure of Prey puts a green creature from hand onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    lands(game, "Forest", 2, B);
    const lure = toHand(game, "Lure of Prey");
    const bears = toHand(game, "Grizzly Bears");
    toStep(game, "precombat-main", B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    game.advanceUntil((s) => s.priority.holder === A);
    pickFromZone(a, bears);
    cast(game, lure);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Afiya Grove moves a counter each upkeep and is sacrificed when it runs out", () => {
    const { game, a } = table();
    const grove = enter(game, "Afiya Grove");
    const bears = spawn(game, "Grizzly Bears");
    expect(counters(game, grove)).toBe(3);
    pickTargets(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, grove)).toBe(2);
    toStep(game, "upkeep");
    settle(game);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears)).toBe(3);
    expect(zone(game, grove)).toBe("graveyard");
  });

  it("Ancestral Memories puts two of the top seven into hand and the rest into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const before = hand(game, A).length;
    const gyBefore = game.state.zones.perPlayer[A].graveyard.length;
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 2);
    cast(game, toHand(game, "Ancestral Memories"));
    expect(hand(game, A).length).toBe(before + 2);
    // The spell itself plus the five cards not chosen.
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(gyBefore + 6);
  });
});
